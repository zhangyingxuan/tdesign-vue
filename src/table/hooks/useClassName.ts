import { useConfig } from '../../config-provider/useConfig';

export default function useClassName() {
  const { classPrefix } = useConfig();
  const classNames = {
    classPrefix: classPrefix.value,
    tableBaseClass: {
      table: `${classPrefix.value}-table`,
      columnResizableTable: `${classPrefix.value}-table--column-resizable`,
      overflowVisible: `${classPrefix.value}-table--overflow-visible`,
      body: `${classPrefix.value}-table__body`,
      content: `${classPrefix.value}-table__content`,
      topContent: `${classPrefix.value}-table__top-content`,
      bottomContent: `${classPrefix.value}-table__bottom-content`,
      paginationWrap: `${classPrefix.value}-table__pagination-wrap`,
      tdLastRow: `${classPrefix.value}-table__td-last-row`,
      tdFirstCol: `${classPrefix.value}-table__td-first-col`,
      thCellInner: `${classPrefix.value}-table__th-cell-inner`,
      tableRowEdit: `${classPrefix.value}-table--row-edit`,
      cellEditable: `${classPrefix.value}-table__cell--editable`,
      cellEditWrap: `${classPrefix.value}-table__cell-wrap`,
      bordered: `${classPrefix.value}-table--bordered`,
      striped: `${classPrefix.value}-table--striped`,
      hover: `${classPrefix.value}-table--hoverable`,
      loading: `${classPrefix.value}-table--loading`,
      rowspanAndColspan: `${classPrefix.value}-table--rowspan-colspan`,
      empty: `${classPrefix.value}-table__empty`,
      emptyRow: `${classPrefix.value}-table__empty-row`,
      headerFixed: `${classPrefix.value}-table--header-fixed`,
      columnFixed: `${classPrefix.value}-table--column-fixed`,
      widthOverflow: `${classPrefix.value}-table--width-overflow`,
      multipleHeader: `${classPrefix.value}-table--multiple-header`,
      footerAffixed: `${classPrefix.value}-table--footer-affixed`,
      horizontalBarAffixed: `${classPrefix.value}-table--horizontal-bar-affixed`,
      affixedHeader: `${classPrefix.value}-table--affixed-header`,
      affixedHeaderElm: `${classPrefix.value}-table__affixed-header-elm`,
      affixedFooterElm: `${classPrefix.value}-table__affixed-footer-elm`,
      affixedFooterWrap: `${classPrefix.value}-table__affixed-footer-wrap`,
      // ????????????????????????????????????????????????????????????????????????????????????
      scrollbarDivider: `${classPrefix.value}-table__scroll-bar-divider`,
      // ??????????????? height ?????????????????????????????????????????? table??????????????? table ??????????????? 100%
      fullHeight: `${classPrefix.value}-table--full-height`,
      // ????????????????????????
      resizeLine: `${classPrefix.value}-table__resize-line`,
      obviousScrollbar: `${classPrefix.value}-table__scrollbar--obvious`,
      affixedHeaderWrap: `${classPrefix.value}-table__affixed-header-elm-wrap`,
    },

    tdAlignClasses: {
      left: `${classPrefix.value}-align-left`,
      right: `${classPrefix.value}-align-right`,
      center: `${classPrefix.value}-align-center`,
    },

    tableHeaderClasses: {
      header: `${classPrefix.value}-table__header`,
      thBordered: `${classPrefix.value}-table__header-th--bordered`,
      fixed: `${classPrefix.value}-table__header--fixed`,
      multipleHeader: `${classPrefix.value}-table__header--multiple`,
    },

    tableFooterClasses: {
      footer: `${classPrefix.value}-table__footer`,
      footerSummary: `${classPrefix.value}-table__footer-summary`,
      fixed: `${classPrefix.value}-table__footer--fixed`,
    },

    tableAlignClasses: {
      top: `${classPrefix.value}-vertical-align-top`,
      middle: `${classPrefix.value}-vertical-align-middle`,
      bottom: `${classPrefix.value}-vertical-align-bottom`,
    },

    tableRowFixedClasses: {
      top: `${classPrefix.value}-table__row--fixed-top`,
      bottom: `${classPrefix.value}-table__row--fixed-bottom`,
      firstBottom: `${classPrefix.value}-table__row--fixed-bottom-first`,
      withoutBorderBottom: `${classPrefix.value}-table__row--without-border-bottom`,
    },

    tableColFixedClasses: {
      left: `${classPrefix.value}-table__cell--fixed-left`,
      right: `${classPrefix.value}-table__cell--fixed-right`,
      lastLeft: `${classPrefix.value}-table__cell--fixed-left-last`,
      firstRight: `${classPrefix.value}-table__cell--fixed-right-first`,
      leftShadow: `${classPrefix.value}-table__content--scrollable-to-left`,
      rightShadow: `${classPrefix.value}-table__content--scrollable-to-right`,
    },

    tableLayoutClasses: {
      auto: `${classPrefix.value}-table--layout-auto`,
      fixed: `${classPrefix.value}-table--layout-fixed`,
    },

    tdEllipsisClass: `${classPrefix.value}-table-td--ellipsis`,

    // ??????????????????????????????
    tableFullRowClasses: {
      base: `${classPrefix.value}-table__row--full`,
      innerFullRow: `${classPrefix.value}-table__row-full-inner`,
      innerFullElement: `${classPrefix.value}-table__row-full-element`,
      firstFullRow: `${classPrefix.value}-table__first-full-row`,
      lastFullRow: `${classPrefix.value}-table__last-full-row`,
    },

    // ??????/????????????????????????
    tableExpandClasses: {
      iconBox: `${classPrefix.value}-table__expand-box`,
      iconCell: `${classPrefix.value}-table__expandable-icon-cell`,
      row: `${classPrefix.value}-table__expanded-row`,
      rowInner: `${classPrefix.value}-table__expanded-row-inner`,
      expanded: `${classPrefix.value}-table__row--expanded`,
      collapsed: `${classPrefix.value}-table__row--collapsed`,
    },

    // ???????????????????????????
    tableSortClasses: {
      sortable: `${classPrefix.value}-table__cell--sortable`,
      sortColumn: `${classPrefix.value}-table__sort-column`,
      title: `${classPrefix.value}-table__cell--title`,
      trigger: `${classPrefix.value}-table__cell--sort-trigger`,
      doubleIcon: `${classPrefix.value}-table__double-icons`,
      sortIcon: `${classPrefix.value}-table__sort-icon`,
      iconDirection: {
        asc: `${classPrefix.value}-table-sort-asc`,
        desc: `${classPrefix.value}-table-sort-desc`,
      },
      iconActive: `${classPrefix.value}-table__sort-icon--active`,
      iconDefault: `${classPrefix.value}-icon-sort--default`,
    },

    // ??????????????????????????????
    tableSelectedClasses: {
      selected: `${classPrefix.value}-table__row--selected`,
      disabled: `${classPrefix.value}-table__row--disabled`,
      checkCell: `${classPrefix.value}-table__cell-check`,
    },

    // ???????????????????????????
    tableFilterClasses: {
      filterable: `${classPrefix.value}-table__cell--filterable`,
      popup: `${classPrefix.value}-table__filter-pop`,
      icon: `${classPrefix.value}-table__filter-icon`,
      popupContent: `${classPrefix.value}-table__filter-pop-content`,
      result: `${classPrefix.value}-table__filter-result`,
      inner: `${classPrefix.value}-table__row-filter-inner`,
      bottomButtons: `${classPrefix.value}-table__filter--bottom-buttons`,
      contentInner: `${classPrefix.value}-table__filter-pop-content-inner`,
      iconWrap: `${classPrefix.value}-table__filter-icon-wrap`,
    },

    // ????????????
    asyncLoadingClass: `${classPrefix.value}-table__async-loading`,
    isFocusClass: `${classPrefix.value}-is-focus`,
    isLoadingClass: `${classPrefix.value}-is-loading`,
    isLoadMoreClass: `${classPrefix.value}-is-load-more`,

    // ??????????????????
    tableTreeClasses: {
      col: `${classPrefix.value}-table__tree-col`,
      inlineCol: `${classPrefix.value}-table__tree-col--inline`,
      icon: `${classPrefix.value}-table__tree-op-icon`,
      leafNode: `${classPrefix.value}-table__tree-leaf-node`,
    },

    // ??????????????????
    tableDraggableClasses: {
      rowDraggable: `${classPrefix.value}-table--row-draggable`,
      rowHandlerDraggable: `${classPrefix.value}-table--row-handler-draggable`,
      colDraggable: `${classPrefix.value}-table--col-draggable`,
      handle: `${classPrefix.value}-table__handle-draggable`,
      ghost: `${classPrefix.value}-table__ele--draggable-ghost`,
      chosen: `${classPrefix.value}-table__ele--draggable-chosen`,
      dragging: `${classPrefix.value}-table__ele--draggable-dragging`,
    },

    virtualScrollClasses: {
      cursor: `${classPrefix.value}-table__virtual-scroll-cursor`,
      header: `${classPrefix.value}-table__virtual-scroll-header`,
    },

    positiveRotate90: `${classPrefix.value}-positive-rotate-90`,
    negativeRotate180: `${classPrefix.value}-negative-rotate-180`,
  };

  return classNames;
}

export type TableClassName = ReturnType<typeof useClassName>;
