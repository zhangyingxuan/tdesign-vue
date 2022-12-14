import Vue, { VNode, CreateElement } from 'vue';
import isFunction from 'lodash/isFunction';
import { CaretRightSmallIcon as TdCaretRightSmallIcon } from 'tdesign-icons-vue';
import mixins from '../utils/mixins';
import getConfigReceiverMixins, {
  TreeConfig,
  getKeepAnimationMixins,
  getGlobalIconMixins,
} from '../config-provider/config-receiver';
import TCheckBox from '../checkbox';
import TLoading from '../loading';
import TreeNode from '../_common/js/tree/tree-node';
import { getTNode } from './util';
import { TypeEventState } from './interface';
import { ClassName } from '../common';
import ripple from '../utils/ripple';
import draggableMixins from './mixins/draggable';

const keepAnimationMixins = getKeepAnimationMixins();

export const TreeItemProps = {
  nested: {
    type: Boolean,
    default: false,
  },
  node: {
    type: Object,
  },
  treeScope: {
    type: Object,
  },
  proxyScope: {
    type: Object,
  },
  expandOnClickNode: {
    type: Boolean,
  },
};

const TreeItem = mixins(
  getConfigReceiverMixins<Vue, TreeConfig>('tree'),
  keepAnimationMixins,
  getGlobalIconMixins(),
  draggableMixins(),
).extend({
  name: 'TTreeItem',
  props: TreeItemProps,
  directives: { ripple },
  inject: {
    onDrag: { default: undefined },
  },
  data() {
    return {
      data: null,
      $clicked: false,
      $nodesMap: null,
    };
  },
  computed: {
    classList(): ClassName {
      const { isDragOver, isDragging, dropPosition } = this.dragStates;
      const { node, nested } = this;

      const list = [];

      list.push(`${this.componentName}__item`);
      list.push({
        [`${this.componentName}__item--open`]: node.expanded,
        [`${this.classPrefix}-is-active`]: node.isActivable() ? node.actived : false,
        [`${this.classPrefix}-is-disabled`]: node.isDisabled(),
      });
      list.push({
        [`${this.componentName}__item--draggable`]: node.isDraggable(),
      });
      if (!nested) {
        if (node.visible) {
          list.push(`${this.componentName}__item--visible`);
        } else {
          list.push(`${this.componentName}__item--hidden`);
        }
      }
      // ????????????????????????classList
      const dragClassList = {
        [`${this.componentName}__item--dragging`]: isDragging,
        [`${this.componentName}__item--tip-top`]: isDragOver && dropPosition < 0,
        [`${this.componentName}__item--tip-bottom`]: isDragOver && dropPosition > 0,
        [`${this.componentName}__item--tip-highlight`]: !isDragging && isDragOver && dropPosition === 0,
      };
      return list.concat(dragClassList);
    },
  },
  methods: {
    getStyles(): string {
      const { level, visible } = this.node;
      const levelStyle = `--level: ${level};`;
      const hiddenStyle = 'display:none;';
      if (visible) return levelStyle;
      return `${hiddenStyle} ${levelStyle}`;
    },
    renderLine(createElement: CreateElement): VNode {
      const { node, treeScope, proxyScope } = this;
      const { line } = treeScope;
      const { scopedSlots } = proxyScope;
      const iconVisible = !!treeScope.icon;

      let lineNode = null;
      if (line === true) {
        if (scopedSlots?.line) {
          lineNode = scopedSlots.line({
            node: node?.getModel(),
          });
        } else if (node.parent && node.tree) {
          const { vmIsLeaf, vmIsFirst, level } = node;

          const lineClasses = [];

          // ?????????????????????????????????????????????
          lineClasses.push(`${this.componentName}__line`);

          // ???????????????????????????????????????????????? icon ??????
          // ???????????????icon ???????????????????????????????????????
          if (vmIsLeaf || !iconVisible) {
            lineClasses.push(`${this.componentName}__line--leaf`);
          }

          // ????????????????????????????????????????????????????????????????????? icon ??????
          // ?????? icon ???????????????????????????????????????
          if (vmIsFirst && iconVisible) {
            lineClasses.push(`${this.componentName}__line--first`);
          }

          // ????????????????????????????????????????????????
          // ??????????????????????????????
          const shadowStyles: string[] = [];
          const parents = node.getParents();
          parents.pop();
          parents.forEach((pnode: TreeNode, index: number) => {
            if (!pnode.vmIsLast) {
              shadowStyles.push(`calc(-${index + 1} * var(--space)) 0 var(--color)`);
            }
          });

          const styles = {
            '--level': level ? String(level) : undefined,
            'box-shadow': shadowStyles.join(','),
          };

          lineNode = <span class={lineClasses} style={styles}></span>;
        }
      } else {
        lineNode = getTNode(line, {
          createElement,
          node,
        });
      }
      return lineNode;
    },
    getFolderIcon() {
      if (isFunction(this.global.folderIcon)) {
        return this.global.folderIcon(this.$createElement);
      }
      const { CaretRightSmallIcon } = this.useGlobalIcon({
        CaretRightSmallIcon: TdCaretRightSmallIcon,
      });
      return <CaretRightSmallIcon />;
    },
    renderIcon(createElement: CreateElement): VNode {
      const { node, treeScope, proxyScope } = this;
      const { icon } = treeScope;
      const { scopedSlots } = proxyScope;
      let isDefaultIcon = false;

      let iconNode = null;
      if (icon === true) {
        if (scopedSlots?.icon) {
          iconNode = scopedSlots.icon({
            node: node?.getModel(),
          });
        } else if (!node.vmIsLeaf) {
          isDefaultIcon = true;
          iconNode = this.getFolderIcon();
          if (node.loading && node.expanded) {
            iconNode = <TLoading />;
          }
        } else {
          iconNode = '';
        }
      } else {
        iconNode = getTNode(icon, {
          createElement,
          node,
        });
      }

      iconNode = (
        <span
          class={[
            `${this.componentName}__icon`,
            `${this.classPrefix}-folder-icon`,
            isDefaultIcon ? `${this.componentName}__icon--default` : '',
          ]}
          trigger="expand"
          ignore="active"
        >
          {iconNode}
        </span>
      );
      return iconNode;
    },
    renderLabel(createElement: CreateElement): VNode {
      const {
        node, treeScope, proxyScope, expandOnClickNode,
      } = this;
      const { label, disableCheck } = treeScope;
      const { scopedSlots } = proxyScope;
      const checkProps = treeScope.checkProps || {};

      let labelNode = null;
      if (label === true) {
        if (scopedSlots?.label) {
          labelNode = scopedSlots.label({
            node: node?.getModel(),
          });
        } else {
          labelNode = node.label || '';
        }
      } else {
        labelNode = getTNode(label, {
          createElement,
          node,
        });
      }

      const labelClasses = [
        `${this.componentName}__label`,
        {
          [`${this.classPrefix}-is-active`]: node.isActivable() ? node.actived : false,
        },
      ];

      if (node.vmCheckable) {
        let checkboxDisabled = false;
        if (typeof disableCheck === 'function') {
          checkboxDisabled = disableCheck(node);
        } else {
          checkboxDisabled = !!disableCheck;
        }
        if (node.isDisabled()) {
          checkboxDisabled = true;
        }
        const itemCheckProps = {
          ...checkProps,
          disabled: checkboxDisabled,
        };

        labelNode = (
          <TCheckBox
            v-ripple={this.keepAnimation.ripple}
            class={labelClasses}
            checked={node.checked}
            indeterminate={node.indeterminate}
            disabled={node.isDisabled()}
            name={String(node.value)}
            onChange={this.handleChange}
            stopLabelTrigger={expandOnClickNode && node.children?.length > 0}
            ignore="expand,active"
            {...{ props: itemCheckProps }}
          >
            {labelNode}
          </TCheckBox>
        );
      } else {
        const inner = <span style="position: relative">{labelNode}</span>;
        labelNode = node.isActivable() ? ( // ??????key????????????????????????????????????????????????ripple??????
          <span key="1" v-ripple={this.keepAnimation.ripple} class={labelClasses}>
            {inner}
          </span>
        ) : (
          <span key="2" class={labelClasses}>
            {inner}
          </span>
        );
      }

      return labelNode;
    },
    renderOperations(createElement: CreateElement): VNode {
      const { node, treeScope, proxyScope } = this;
      const { operations } = treeScope;
      const { scopedSlots } = proxyScope;

      let opNode = null;
      if (scopedSlots?.operations) {
        opNode = scopedSlots.operations({
          node: node?.getModel(),
        });
      } else {
        opNode = getTNode(operations, {
          createElement,
          node,
        });
      }
      if (opNode) {
        opNode = (
          <span class={`${this.componentName}__operations`} ignore="active,expand">
            {opNode}
          </span>
        );
      }
      return opNode;
    },
    renderItem(createElement: CreateElement): Array<VNode> {
      const itemNodes: Array<VNode> = [];
      const iconNode = this.renderIcon(createElement);
      // ????????????????????????????????????????????????????????????????????????
      const lineNode = this.renderLine(createElement);

      if (lineNode) {
        itemNodes.push(lineNode);
      }

      if (iconNode) {
        itemNodes.push(iconNode);
      }

      const labelNode = this.renderLabel(createElement);
      if (labelNode) {
        itemNodes.push(labelNode);
      }

      const opNode = this.renderOperations(createElement);
      if (opNode) {
        itemNodes.push(opNode);
      }

      return itemNodes;
    },
    handleClick(evt: MouseEvent) {
      const srcTarget = evt.target as HTMLElement;
      const isBranchTrigger = this.node.children
        && this.expandOnClickNode
        && (srcTarget.className === `${this.classPrefix}-checkbox__input` || srcTarget.tagName.toLowerCase() === 'input');
      // checkbox ????????? emit click ??????
      // ?????????????????????????????? click ???????????????
      if (this.$clicked || isBranchTrigger) return;

      // ??????expandOnClickNode??????checkbox????????????????????????
      if (
        this.expandOnClickNode
        && this.node.children
        && srcTarget.className?.indexOf?.(`${this.classPrefix}-tree__label`) !== -1
      ) evt.preventDefault();

      this.$clicked = true;
      setTimeout(() => {
        this.$clicked = false;
      });

      const { node } = this;
      const state: TypeEventState = {
        mouseEvent: evt,
        event: evt,
        node,
        path: node.getPath(),
      };
      this.$emit('click', state);
    },

    handleChange() {
      const { node } = this;
      const event = new Event('change');
      const state: TypeEventState = {
        event,
        node,
      };
      this.$emit('change', state);
    },
    proxyClick(state: TypeEventState) {
      this.$emit('click', state);
    },
    proxyChange(state: TypeEventState) {
      this.$emit('change', state);
    },
    // ???????????? tree ??????
    getNestedItem(node: TreeNode) {
      const { nested, treeScope, proxyScope } = this;
      const treeItem = (
        <TreeItem
          key={node.value}
          node={node}
          nested={nested}
          treeScope={treeScope}
          proxyScope={proxyScope}
          onClick={this.proxyClick}
          onChange={this.proxyChange}
        />
      );
      return treeItem;
    },
    getChildNodes() {
      const { node, $nodesMap } = this;
      // ???????????????????????????
      let children: TreeNode[] = [];
      if (Array.isArray(node.children)) {
        children = node.children;
      }

      const curNodesMap = new Map();
      const childrenNodes = children.map((child: TreeNode) => {
        curNodesMap.set(child.value, 1);
        let nodeView = $nodesMap.get(child.value);
        if (!nodeView && child.visible) {
          nodeView = this.getNestedItem(child);
          $nodesMap.set(child.value, nodeView);
        }
        return nodeView;
      });

      // ???????????????????????????
      this.$nextTick(() => {
        const keys = [...$nodesMap.keys()];
        keys.forEach((value: string) => {
          if (!curNodesMap.get(value)) {
            $nodesMap.delete(value);
          }
        });
        curNodesMap.clear();
      });

      return childrenNodes;
    },
  },
  created() {
    const { node } = this;
    if (node) {
      this.data = node.data;
    }
    this.$nodesMap = new Map();
  },
  destroyed() {
    this.data = null;
    this.$nodesMap.clear();
  },
  render(createElement: CreateElement) {
    const { node, nested } = this;
    const { tree, level, value } = node;

    if (!tree || !tree.nodeMap.get(value)) {
      this.$destroy();
    }

    const styles = this.getStyles();
    const { classList } = this;
    const itemNode = (
      <div
        class={classList}
        data-value={value}
        data-level={level}
        style={styles}
        draggable={node.isDraggable()}
        onClick={(evt: MouseEvent) => this.handleClick(evt)}
        onDragstart={(evt: DragEvent) => this.handleDragStart(evt)}
        onDragend={(evt: DragEvent) => this.handleDragEnd(evt)}
        onDragover={(evt: DragEvent) => this.handleDragOver(evt)}
        onDragleave={(evt: DragEvent) => this.handleDragLeave(evt)}
        onDrop={(evt: DragEvent) => this.handleDrop(evt)}
      >
        {this.renderItem(createElement)}
      </div>
    );

    if (!nested) {
      // ??????????????????????????????
      return itemNode;
    }

    const childNodes = this.getChildNodes();

    const childrenClassList = [];
    childrenClassList.push(`${this.componentName}__children`);
    if (node.expanded) {
      childrenClassList.push(`${this.componentName}__children--visible`);
    } else {
      childrenClassList.push(`${this.componentName}__children--hidden`);
    }

    const allChildren = node.walk();
    allChildren.shift();
    const allExpandedChildren = allChildren.filter((node: TreeNode) => {
      const parent = node.getParent();
      if (!parent) return true;
      return parent.expanded;
    });
    const childrenStyles = {
      '--hscale': allExpandedChildren.length,
    };

    const childrenBox = (
      <transition-group
        tag="div"
        class={childrenClassList}
        style={childrenStyles}
        enter-active-class={`${this.componentName}__item--enter-active`}
        leave-active-class={`${this.componentName}__item--leave-active`}
      >
        {childNodes}
      </transition-group>
    );

    const branchNode = (
      <div class={`${this.componentName}__branch`}>
        {itemNode}
        {childrenBox}
      </div>
    );
    return branchNode;
  },
});

export default TreeItem;
