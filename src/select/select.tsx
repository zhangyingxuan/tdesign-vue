import {
  computed,
  defineComponent,
  ref,
  SetupContext,
  toRefs,
  watch,
  nextTick,
  getCurrentInstance,
  provide,
} from '@vue/composition-api';
import isFunction from 'lodash/isFunction';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import useDefaultValue from '../hooks/useDefaultValue';
import useVModel from '../hooks/useVModel';
import { useTNodeJSX } from '../hooks/tnode';
import { useConfig, usePrefixClass } from '../config-provider/useConfig';
import {
  TdSelectProps, SelectValue, TdOptionProps, SelectValueChangeTrigger,
} from './type';
import props from './props';
import TLoading from '../loading';
import Popup, { PopupVisibleChangeContext } from '../popup';
import TInput from '../input/index';
import Tag from '../tag/index';
import SelectInput, {
  SelectInputValue,
  SelectInputChangeContext,
  SelectInputValueChangeContext,
} from '../select-input';
import FakeArrow from '../common-components/fake-arrow';
import { off, on } from '../utils/dom';
import Option from './option';
import SelectPanel from './select-panel';
import {
  getSingleContent, getMultipleContent, getNewMultipleValue, flattenOptions,
} from './util';
import useSelectOptions from './hooks/useSelectOptions';
import { SelectPanelInstance } from './instance';
import log from '../_common/js/log';
import useFormDisabled from '../hooks/useFormDisabled';

export type OptionInstance = InstanceType<typeof Option>;

export default defineComponent({
  name: 'TSelect',
  props: { ...props },
  components: {
    TInput,
    TLoading,
    Tag,
    Popup,
    TOption: Option,
    FakeArrow,
    SelectPanel,
  },
  setup(props: TdSelectProps, context: SetupContext) {
    const { t, global } = useConfig('select');
    const renderTNode = useTNodeJSX();
    const instance = getCurrentInstance();
    const selectInputRef = ref<HTMLElement>(null);
    const selectPanelRef = ref<SelectPanelInstance>();
    const popupOpenTime = ref(250);
    const { formDisabled } = useFormDisabled();
    const COMPONENT_NAME = usePrefixClass('select');
    const { classPrefix } = useConfig('classPrefix');

    const {
      valueType,
      disabled,
      size,
      value: valueProps,
      multiple,
      placeholder,
      loading,
      max,
      reserveKeyword,
      inputValue,
      popupVisible,
      minCollapsedNum,
      creatable,
    } = toRefs(props);

    const keys = computed(() => ({
      label: props.keys?.label || 'label',
      value: props.keys?.value || 'value',
    }));
    const { options: innerOptions, optionsMap, optionsList } = useSelectOptions(props, instance, keys);

    const [value, setValue] = useVModel(valueProps, props.defaultValue, props.onChange, 'change');
    const innerValue = computed(() => {
      const isObjValue = valueType.value === 'object';
      let _value = value.value;
      // ???????????? value ?????????????????????
      if (!multiple.value && isArray(_value)) {
        log.warn('Select', 'Invalid value for "value" props: got an Array when multiple was set to false');
        _value = isObjValue ? {} : '';
      }
      if (multiple.value && !isArray(_value)) {
        log.warn('Select', 'Invalid value for "value" props: expected an Array when multiple was set to true');
        _value = [];
      }

      // ?????? object ?????? value???????????? keys.value ???????????????????????? value ???
      if (isObjValue) {
        if (multiple.value) {
          return (_value as SelectValue[])
            .filter((option) => {
              const isObj = isObject(option);
              if (!isObj) {
                log.warn('Select', `Invalid value for "value" props: expected an Object, but got ${typeof option}`);
              }
              return isObj;
            })
            .map((option) => option[keys.value.value]);
        }
        const isObj = isObject(_value);
        if (!isObj) {
          log.warn('Select', `Invalid value for "value" props: expected an Object, but got ${typeof _value}`);
          return '';
        }
        return _value[keys.value.value];
      }
      // value ????????? value ?????????????????????
      return _value;
    });
    const setInnerValue = (
      newVal: SelectValue,
      context: { trigger: SelectValueChangeTrigger; e?: MouseEvent | KeyboardEvent },
      optionValue?: SelectValue,
    ) => {
      if (newVal === value.value) return;

      const selectedOptions: TdOptionProps[] = [];
      const { value: valueOfKeys, label: labelOfKeys } = keys.value;
      // ?????????????????????????????? value ?????? option ??????????????????????????????????????? options ???????????????????????????????????????
      const oldValueMap = new Map<SelectValue, TdOptionProps>();
      if (multiple.value) {
        const mapValue = value.value || [];
        (mapValue as TdOptionProps[]).forEach?.((option) => {
          oldValueMap.set(option[valueOfKeys], option);
        });
      }
      const getOriginOptions = (val: SelectValue) => {
        const option = optionsMap.value.get(val);
        if (option) delete (option as any).index;
        return option;
      };
      const getFormatOption = (val: SelectValue) => {
        const option = optionsMap.value.get(val) || oldValueMap.get(val);
        if (option) delete (option as any).index;
        return {
          [valueOfKeys]: get(option, valueOfKeys),
          [labelOfKeys]: get(option, labelOfKeys),
        };
      };

      // ?????? selectOptions
      if (multiple.value) {
        (newVal as SelectValue[]).forEach((v) => selectedOptions.push(getOriginOptions(v)));
      } else {
        selectedOptions.push(getOriginOptions(newVal));
      }
      // ??? value ??? object ?????????????????? innerValue ??????????????? object
      if (valueType.value === 'object') {
        // eslint-disable-next-line no-param-reassign
        newVal = multiple.value
          ? (newVal as SelectValue[]).map((val) => getFormatOption(val))
          : getFormatOption(newVal);
      }

      const outputContext = { ...context, selectedOptions };
      if (optionValue) {
        // eslint-disable-next-line dot-notation
        outputContext['option'] = getOriginOptions(optionValue);
      }
      setValue(newVal, outputContext);
    };

    const [tInputValue, setTInputValue] = useDefaultValue(
      inputValue,
      props.defaultInputValue || '',
      props.onInputChange,
      'inputValue',
      'input-change',
    );

    const [innerPopupVisible, setInnerPopupVisible] = useDefaultValue(
      popupVisible,
      props.defaultPopupVisible,
      (visible: boolean, context: PopupVisibleChangeContext) => {
        props.onPopupVisibleChange?.(visible, context);
        instance.emit('visible-change', visible);
      },
      'popupVisible',
      'popup-visible-change',
    );

    const isDisabled = computed(() => formDisabled.value || disabled.value);
    const isLoading = computed(() => loading.value && !isDisabled.value);
    // ??????????????????
    const isFilterable = computed(() => Boolean(props.filterable || global.value.filterable || isFunction(props.filter)));
    // ????????????????????????????????? max ??????
    const isReachMaxLimit = computed(
      () => multiple.value && max.value !== 0 && max.value <= (innerValue.value as SelectValue[]).length,
    );

    const placeholderText = computed(
      () => ((!multiple.value
          && innerPopupVisible.value
          && ((valueType.value === 'object' && (value.value?.[keys.value.label] || innerValue.value))
            || getSingleContent(innerValue.value, optionsList.value)))
          || placeholder.value)
        ?? t(global.value.placeholder),
    );

    const displayText = computed(() => {
      if (multiple.value) {
        if (valueType.value === 'object') {
          return (value.value as SelectValue[]).map((v) => v[keys.value.label]);
        }
        return getMultipleContent(innerValue.value as SelectValue[], optionsList.value);
      }
      if (valueType.value === 'object') {
        return value.value?.[keys.value.label] || innerValue.value;
      }
      return getSingleContent(innerValue.value, optionsList.value);
    });

    const valueDisplayParams = computed(() => {
      const val = multiple.value
        ? (innerValue.value as SelectValue[]).map((value) => ({
          value,
          label: optionsMap.value.get(value)?.label,
        }))
        : innerValue.value;
      return {
        value: val,
        onClose: multiple.value ? (index: number) => removeTag(index) : () => {},
      };
    });

    const collapsedItemsParams = computed(() => multiple.value
      ? {
        value: innerValue.value,
        collapsedSelectedItems: innerValue.value.slice(minCollapsedNum.value),
        count: innerValue.value.length - minCollapsedNum.value,
      }
      : {});

    const removeTag = (index: number, context?: { e?: MouseEvent | KeyboardEvent }) => {
      const { e } = context || {};
      e?.stopPropagation();
      if (isDisabled.value) {
        return;
      }
      const selectValue = cloneDeep(innerValue.value) as SelectValue[];
      const value = selectValue[index];
      selectValue.splice(index, 1);
      setInnerValue(selectValue, { e, trigger: 'tag-remove' });
      const evtObj = {
        value: value as string | number,
        data: optionsMap.value.get(value),
        e,
      };
      instance.emit('remove', evtObj);
      props.onRemove?.(evtObj);
    };

    const handleCreate = () => {
      if (!tInputValue.value) return;
      const createVal = tInputValue.value;
      // ??????????????????????????????????????????????????????????????????????????????????????? popup ????????????????????????????????????
      multiple.value && setTInputValue('');
      instance.emit('create', createVal);
      props.onCreate?.(createVal);
    };

    const handleClear = ({ e }: { e: MouseEvent }) => {
      e?.stopPropagation();
      if (multiple.value) {
        setInnerValue([], { trigger: 'clear', e });
      } else {
        setInnerValue('', { trigger: 'clear', e });
      }
      instance.emit('clear', { e });
      props.onClear?.({ e });
    };

    const handleTInputValueChange = (val: string, context: SelectInputValueChangeContext) => {
      if (context.trigger === 'blur' || !innerPopupVisible.value) return;
      setTInputValue(val);
      debounceSearch();
    };

    const handleTagChange = (currentTags: SelectInputValue, context: SelectInputChangeContext) => {
      const { trigger, index, e } = context;
      if (trigger === 'clear') {
        setInnerValue([], { trigger: 'tag-remove', e });
      }
      if (['tag-remove', 'backspace'].includes(trigger)) {
        removeTag(index);
      }
    };

    const handleFocus = (value: string, context: { e: FocusEvent }) => {
      instance.emit('focus', { value, e: context?.e });
      props.onFocus?.({ value, e: context?.e });
    };

    const handleBlur = (value: string, context: { e: FocusEvent | KeyboardEvent }) => {
      instance.emit('blur', { value, e: context?.e });
      props.onBlur?.({ value, e: context?.e });
    };

    const handleEnter = (value: string, context: { e: KeyboardEvent }) => {
      instance.emit('enter', { value, e: context?.e, inputValue: tInputValue.value });
      props.onEnter?.({ value, e: context?.e, inputValue: tInputValue.value.toString() });
    };

    const debounceSearch = debounce(() => {
      instance.emit('search', tInputValue.value);
      props.onSearch?.(tInputValue.value.toString());
    }, 300);

    const getOverlayElm = (): HTMLElement => {
      let r;
      try {
        const popupRefs = (context.refs.selectInputRef as any).$refs.selectInputRef.$refs;
        r = popupRefs.overlay || popupRefs.component.$refs.overlay;
      } catch (e) {
        log.warn('Select', e);
      }
      return r;
    };

    const updateScrollTop = (content: HTMLDivElement) => {
      // ?????????????????????????????????????????????
      if (props.scroll?.type === 'virtual') return;
      const overlayEl = getOverlayElm();
      if (!overlayEl) return;
      const firstSelectedNode: HTMLDivElement = overlayEl?.querySelector(`.${classPrefix.value}-is-selected`);
      nextTick(() => {
        if (firstSelectedNode && content) {
          const { paddingBottom } = getComputedStyle(firstSelectedNode);
          const { marginBottom } = getComputedStyle(content);
          const elementBottomHeight = parseInt(paddingBottom, 10) + parseInt(marginBottom, 10);
          // ??????0???????????????????????????????????????0
          const updateValue = firstSelectedNode.offsetTop
            - content.offsetTop
            - (content.clientHeight - firstSelectedNode.clientHeight)
            + elementBottomHeight;
          // eslint-disable-next-line no-param-reassign
          content.scrollTop = updateValue;
        }
      });
    };

    // ????????????????????????
    const hoverIndex = ref(-1);
    const keydownEvent = (e: KeyboardEvent) => {
      const displayOptions: (TdOptionProps & { isCreated?: boolean })[] = flattenOptions(
        selectPanelRef.value?.getDisplayOptions(),
      );

      const displayOptionsLength = displayOptions.length;
      const arrowDownOption = () => {
        let count = 0;
        while (hoverIndex.value < displayOptionsLength) {
          if (!(displayOptions[hoverIndex.value] as TdOptionProps)?.disabled) {
            break;
          }
          if (hoverIndex.value === displayOptionsLength - 1) {
            hoverIndex.value = 0;
          } else {
            hoverIndex.value += 1;
          }
          count += 1;
          if (count >= displayOptionsLength) break;
        }
      };
      const arrowUpOption = () => {
        let count = 0;
        while (hoverIndex.value > -1) {
          if (!(displayOptions[hoverIndex.value] as TdOptionProps)?.disabled) {
            break;
          }
          if (hoverIndex.value === 0) {
            hoverIndex.value = displayOptionsLength - 1;
          } else {
            hoverIndex.value -= 1;
          }
          count += 1;
          if (count >= displayOptionsLength) break;
        }
      };
      if (displayOptionsLength === 0) return;
      const preventKeys = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'];
      if (preventKeys.includes(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case 'ArrowDown':
          if (hoverIndex.value === -1) {
            hoverIndex.value = 0;
            return;
          }
          if (hoverIndex.value < displayOptionsLength - 1) {
            hoverIndex.value += 1;
            arrowDownOption();
          } else {
            hoverIndex.value = 0;
            arrowDownOption();
          }
          break;
        case 'ArrowUp':
          if (hoverIndex.value === -1) {
            hoverIndex.value = 0;
            return;
          }
          if (hoverIndex.value > 0) {
            hoverIndex.value -= 1;
            arrowUpOption();
          } else {
            hoverIndex.value = displayOptionsLength - 1;
            arrowUpOption();
          }
          break;
        case 'Enter':
          // ????????????????????? hoverIndex ??? -1(?????????)/0(????????????)??????????????????????????????????????????????????? create ??????????????????????????????
          if (creatable.value && hoverIndex.value < 1 && displayOptions?.[0]?.isCreated) {
            handleCreate();
          } else if (hoverIndex.value === -1) {
            // ???????????????????????????????????????????????????
            // ??? hoverIndex ??? -1???????????????????????????????????????????????????????????????
            return;
          }
          // enter ????????????
          if (!multiple.value) {
            const optionValue = (displayOptions[hoverIndex.value] as TdOptionProps).value;
            setInnerValue(
              optionValue,
              {
                e,
                trigger: 'check',
              },
              optionValue,
            );
            setInnerPopupVisible(false, { e });
          } else {
            const optionValue = (displayOptions[hoverIndex.value] as TdOptionProps)?.value;
            if (!optionValue) return;
            const newValue = getNewMultipleValue(innerValue.value, optionValue);
            setInnerValue(newValue.value, { e, trigger: newValue.isCheck ? 'check' : 'uncheck' }, optionValue);
          }
          break;
        case 'Escape':
        case 'Tab':
          setInnerPopupVisible(false, { trigger: 'keydown-esc', e });
          setTInputValue('');
          break;
      }
    };

    // ??? eventListener ???????????? sync watch????????????????????????????????????????????????????????? (https://github.com/Tencent/tdesign-vue/issues/1170)
    watch(
      innerPopupVisible,
      (val) => {
        val && on(document, 'keydown', keydownEvent);
        !val && off(document, 'keydown', keydownEvent);
      },
      {
        flush: 'sync',
      },
    );
    // ???????????????????????? pre watch
    watch(innerPopupVisible, (value) => {
      if (value) {
        // ?????? popup ??????????????? hover ????????????
        hoverIndex.value = -1;
      } else {
        tInputValue.value && setTInputValue('');
      }
    });

    provide('tSelect', {
      size,
      multiple,
      popupOpenTime,
      hoverIndex,
      selectValue: innerValue,
      reserveKeyword,
      isReachMaxLimit,
      getOverlayElm,
      handleCreate,
      handleValueChange: setInnerValue,
      handlerInputChange: setTInputValue,
      handlePopupVisibleChange: setInnerPopupVisible,
    });

    return {
      isFilterable,
      isDisabled,
      isLoading,
      innerOptions,
      placeholderText,
      selectInputRef,
      selectPanelRef,
      innerPopupVisible,
      displayText,
      tInputValue,
      collapsedItemsParams,
      valueDisplayParams,
      handleFocus,
      handleBlur,
      handleEnter,
      handleClear,
      handleTagChange,
      handleTInputValueChange,
      setInnerPopupVisible,
      removeTag,
      renderTNode,
      updateScrollTop,
      componentName: COMPONENT_NAME,
    };
  },

  methods: {
    renderSuffixIcon() {
      const {
        isLoading, showArrow, innerPopupVisible, isDisabled,
      } = this;
      if (isLoading) {
        return (
          <t-loading class={[`${this.componentName}__right-icon`, `${this.componentName}__active-icon`]} size="small" />
        );
      }
      return showArrow ? (
        <fake-arrow
          overlayClassName={`${this.componentName}__right-icon`}
          isActive={innerPopupVisible && !isDisabled}
        />
      ) : null;
    },
  },

  render() {
    const { renderTNode } = this;

    const prefixIcon = () => renderTNode('prefixIcon');
    const valueDisplay = () => renderTNode('valueDisplay', { params: this.valueDisplayParams });
    const collapsedItems = () => renderTNode('collapsedItems', { params: this.collapsedItemsParams });

    const { overlayClassName, ...restPopupProps } = this.popupProps || {};

    return (
      <div ref="select" class={`${this.componentName}__wrap`}>
        <SelectInput
          ref="selectInputRef"
          class={this.componentName}
          autoWidth={this.autoWidth}
          borderless={this.borderless}
          readonly={this.readonly}
          allowInput={this.isFilterable}
          multiple={this.multiple}
          keys={this.keys}
          status={this.status}
          tips={this.tips}
          value={this.displayText}
          valueDisplay={valueDisplay}
          clearable={this.clearable}
          disabled={this.isDisabled}
          label={prefixIcon}
          suffixIcon={this.renderSuffixIcon}
          placeholder={this.placeholderText}
          inputValue={this.tInputValue}
          inputProps={{
            size: this.size,
            ...this.inputProps,
          }}
          tagInputProps={{
            autoWidth: true,
            ...this.tagInputProps,
          }}
          tagProps={this.tagProps}
          minCollapsedNum={this.minCollapsedNum}
          collapsedItems={collapsedItems}
          popupVisible={this.innerPopupVisible}
          popupProps={{
            overlayClassName: [`${this.componentName}__dropdown`, overlayClassName],
            ...restPopupProps,
          }}
          on={{
            focus: this.handleFocus,
            blur: this.handleBlur,
            enter: this.handleEnter,
            clear: this.handleClear,
            'input-change': this.handleTInputValueChange,
            'popup-visible-change': this.setInnerPopupVisible,
            'tag-change': this.handleTagChange,
          }}
          {...this.selectInputProps}
          updateScrollTop={this.updateScrollTop}
        >
          <select-panel
            ref="selectPanelRef"
            slot="panel"
            scopedSlots={this.$scopedSlots}
            size={this.size}
            options={this.innerOptions}
            inputValue={this.tInputValue}
            multiple={this.multiple}
            empty={this.empty}
            filter={this.filter}
            filterable={this.isFilterable}
            creatable={this.creatable}
            scroll={this.scroll}
            loading={this.isLoading}
            loadingText={this.loadingText}
            panelTopContent={this.panelTopContent}
            panelBottomContent={this.panelBottomContent}
          />
        </SelectInput>
      </div>
    );
  },
});
