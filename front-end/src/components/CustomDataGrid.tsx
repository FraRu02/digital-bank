import { IconButton, InputAdornment, TextField, type IconButtonProps } from '@mui/material';
import { DataGrid, QuickFilter, QuickFilterClear, QuickFilterControl, type DataGridProps, type GridRowSelectionModel, type ToolbarProps as GridToolbarProps } from '@mui/x-data-grid';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import Utilities from '@/src/classes/Utilities';
import { alpha, styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .cell-edited': {
    backgroundColor: alpha(theme.palette.warning.light, 0.5),
    transition: 'background-color 0.3s ease',
  },
}));

type CustomDataGridContextProps = {
  rows: readonly any[] | undefined;
  dataGrid: DataGridProps;
  activeEditMode?: boolean;
  selectedRows: GridRowSelectionModel;
  editedRows: Record<string, any>;
  setRows: React.Dispatch<React.SetStateAction<readonly any[] | undefined>>;
  setSelectedRows:  React.Dispatch<React.SetStateAction<GridRowSelectionModel>>;
  setEditedRows: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

type RootProps = {
  dataGrid: DataGridProps;
  children?: React.ReactNode;
  activeEditMode?: boolean;
}


const CustomDataGridContext = createContext<CustomDataGridContextProps|undefined>(undefined);
const useCustomDataGrid = () => useContext(CustomDataGridContext)!;

const emptyValue:GridRowSelectionModel = {type: "include", ids: new Set([])};

const Root:React.FC<RootProps> = ({children, activeEditMode, dataGrid}) => {
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(emptyValue);
  const [editedRows, setEditedRows] = useState<Record<string, any>>({});
  const [rows, setRows] = useState(dataGrid.rows);

  useEffect(() => {
    setRows(dataGrid.rows);
  }, [dataGrid.rows])

  useEffect(() => {
    if(!activeEditMode) {
      setSelectedRows(emptyValue);
      setEditedRows({});
    };
  }, [activeEditMode])

  const value:CustomDataGridContextProps = {
    rows, setRows,
    dataGrid,
    activeEditMode,
    selectedRows, setSelectedRows,
    editedRows, setEditedRows,
  }

  return (
    <CustomDataGridContext.Provider value={value}>
      {children}
    </CustomDataGridContext.Provider>
  )
}

type ToolbarProps = GridToolbarProps & {
  children?: React.ReactNode;
}

const Toolbar:React.FC<ToolbarProps> = ({children}) => {

  return children;
};

const Table:React.FC<{toolbar?: React.ReactNode}> = ({toolbar}) => {
  const {t} = useTranslation();
  const {rows, dataGrid, activeEditMode, editedRows, selectedRows, setSelectedRows, setEditedRows} = useCustomDataGrid();
  const CustomToolbar = useMemo(() => Toolbar, [])

  const handleProcessRowUpdate = useCallback((newRow: any) => {
    setEditedRows((prev) => {
      const initialRow = rows?.find((e) => e.id === newRow.id);
      const diff = Utilities.getDiffObjKeys(newRow, initialRow);
      if(Object.keys(diff).length <= 0) {
        if(prev[newRow.id]) {
          delete prev[newRow.id];
          return {...prev};
        }
      }else if(!prev[newRow.id]) {
        return {...prev, [newRow.id]: diff};
      }
      return prev;
    })
    return newRow;
  }, [rows]);



  return (
    <StyledDataGrid
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      rowSelectionModel={selectedRows ?? undefined}
      onRowSelectionModelChange={(r) => setSelectedRows(r)}
      checkboxSelection={Boolean(activeEditMode)}
      disableRowSelectionOnClick
      isCellEditable={() => Boolean(activeEditMode)}
      processRowUpdate={handleProcessRowUpdate}
      onProcessRowUpdateError={(error) => console.log("error: ", error)}
      getCellClassName={(params) => editedRows[params.id]?.[params.field] ? 'cell-edited' : ''}
      showToolbar
      slots={{
        toolbar: CustomToolbar
      }}
      slotProps={{
        toolbar: {
          children: toolbar
        }
      }}
      {...dataGrid}
      rows={rows}
      localeText={{
        noRowsLabel: t("data_grid.no_rows_label"),
        noResultsOverlayLabel: t("data_grid.no_results_overlay_label"),
        noColumnsOverlayLabel: t("data_grid.no_columns_overlay_label"),
        noColumnsOverlayManageColumns: t("data_grid.no_columns_overlay_manage_columns"),
        emptyPivotOverlayLabel: t("data_grid.empty_pivot_overlay_label"),

        toolbarDensity: t("data_grid.toolbar_density"),
        toolbarDensityLabel: t("data_grid.toolbar_density_label"),
        toolbarDensityCompact: t("data_grid.toolbar_density_compact"),
        toolbarDensityStandard: t("data_grid.toolbar_density_standard"),
        toolbarDensityComfortable: t("data_grid.toolbar_density_comfortable"),

        toolbarColumns: t("data_grid.toolbar_columns"),
        toolbarColumnsLabel: t("data_grid.toolbar_columns_label"),

        toolbarFilters: t("data_grid.toolbar_filters"),
        toolbarFiltersLabel: t("data_grid.toolbar_filters_label"),
        toolbarFiltersTooltipHide: t("data_grid.toolbar_filters_tooltip_hide"),
        toolbarFiltersTooltipShow: t("data_grid.toolbar_filters_tooltip_show"),

        toolbarQuickFilterPlaceholder: t("data_grid.toolbar_quick_filter_placeholder"),
        toolbarQuickFilterLabel: t("data_grid.toolbar_quick_filter_label"),
        toolbarQuickFilterDeleteIconLabel: t("data_grid.toolbar_quick_filter_delete_icon_label"),

        toolbarExport: t("data_grid.toolbar_export"),
        toolbarExportLabel: t("data_grid.toolbar_export_label"),
        toolbarExportCSV: t("data_grid.toolbar_export_csv"),
        toolbarExportPrint: t("data_grid.toolbar_export_print"),
        toolbarExportExcel: t("data_grid.toolbar_export_excel"),

        toolbarPivot: t("data_grid.toolbar_pivot"),
        toolbarCharts: t("data_grid.toolbar_charts"),
        toolbarAssistant: t("data_grid.toolbar_assistant"),

        columnsManagementSearchTitle: t("data_grid.columns_management_search_title"),
        columnsManagementNoColumns: t("data_grid.columns_management_no_columns"),
        columnsManagementShowHideAllText: t("data_grid.columns_management_show_hide_all_text"),
        columnsManagementReset: t("data_grid.columns_management_reset"),
        columnsManagementDeleteIconLabel: t("data_grid.columns_management_delete_icon_label"),

        filterPanelAddFilter: t("data_grid.filter_panel_add_filter"),
        filterPanelRemoveAll: t("data_grid.filter_panel_remove_all"),
        filterPanelDeleteIconLabel: t("data_grid.filter_panel_delete_icon_label"),
        filterPanelLogicOperator: t("data_grid.filter_panel_logic_operator"),
        filterPanelOperator: t("data_grid.filter_panel_operator"),
        filterPanelOperatorAnd: t("data_grid.filter_panel_operator_and"),
        filterPanelOperatorOr: t("data_grid.filter_panel_operator_or"),
        filterPanelColumns: t("data_grid.filter_panel_columns"),
        filterPanelInputLabel: t("data_grid.filter_panel_input_label"),
        filterPanelInputPlaceholder: t("data_grid.filter_panel_input_placeholder"),

        filterOperatorContains: t("data_grid.filter_operator_contains"),
        filterOperatorDoesNotContain: t("data_grid.filter_operator_does_not_contain"),
        filterOperatorEquals: t("data_grid.filter_operator_equals"),
        filterOperatorDoesNotEqual: t("data_grid.filter_operator_does_not_equal"),
        filterOperatorStartsWith: t("data_grid.filter_operator_starts_with"),
        filterOperatorEndsWith: t("data_grid.filter_operator_ends_with"),
        filterOperatorIs: t("data_grid.filter_operator_is"),
        filterOperatorNot: t("data_grid.filter_operator_not"),
        filterOperatorAfter: t("data_grid.filter_operator_after"),
        filterOperatorOnOrAfter: t("data_grid.filter_operator_on_or_after"),
        filterOperatorBefore: t("data_grid.filter_operator_before"),
        filterOperatorOnOrBefore: t("data_grid.filter_operator_on_or_before"),
        filterOperatorIsEmpty: t("data_grid.filter_operator_is_empty"),
        filterOperatorIsNotEmpty: t("data_grid.filter_operator_is_not_empty"),
        filterOperatorIsAnyOf: t("data_grid.filter_operator_is_any_of"),

        headerFilterOperatorContains: t("data_grid.header_filter_operator_contains"),
        headerFilterOperatorDoesNotContain: t("data_grid.header_filter_operator_does_not_contain"),
        headerFilterOperatorEquals: t("data_grid.header_filter_operator_equals"),
        headerFilterOperatorDoesNotEqual: t("data_grid.header_filter_operator_does_not_equal"),
        headerFilterOperatorStartsWith: t("data_grid.header_filter_operator_starts_with"),
        headerFilterOperatorEndsWith: t("data_grid.header_filter_operator_ends_with"),
        headerFilterOperatorIs: t("data_grid.header_filter_operator_is"),
        headerFilterOperatorNot: t("data_grid.header_filter_operator_not"),
        headerFilterOperatorAfter: t("data_grid.header_filter_operator_after"),
        headerFilterOperatorOnOrAfter: t("data_grid.header_filter_operator_on_or_after"),
        headerFilterOperatorBefore: t("data_grid.header_filter_operator_before"),
        headerFilterOperatorOnOrBefore: t("data_grid.header_filter_operator_on_or_before"),
        headerFilterOperatorIsEmpty: t("data_grid.header_filter_operator_is_empty"),
        headerFilterOperatorIsNotEmpty: t("data_grid.header_filter_operator_is_not_empty"),
        headerFilterOperatorIsAnyOf: t("data_grid.header_filter_operator_is_any_of"),
        "headerFilterOperator=": t("data_grid.header_filter_operator_equal"),
        "headerFilterOperator!=": t("data_grid.header_filter_operator_not_equal"),
        "headerFilterOperator>": t("data_grid.header_filter_operator_greater_than"),
        "headerFilterOperator>=": t("data_grid.header_filter_operator_greater_than_or_equal_to"),
        "headerFilterOperator<": t("data_grid.header_filter_operator_less_than"),
        "headerFilterOperator<=": t("data_grid.header_filter_operator_less_than_or_equal_to"),
        headerFilterClear: t("data_grid.header_filter_clear"),

        filterValueAny: t("data_grid.filter_value_any"),
        filterValueTrue: t("data_grid.filter_value_true"),
        filterValueFalse: t("data_grid.filter_value_false"),

        columnMenuLabel: t("data_grid.column_menu_label"),
        columnMenuShowColumns: t("data_grid.column_menu_show_columns"),
        columnMenuManageColumns: t("data_grid.column_menu_manage_columns"),
        columnMenuFilter: t("data_grid.column_menu_filter"),
        columnMenuHideColumn: t("data_grid.column_menu_hide_column"),
        columnMenuUnsort: t("data_grid.column_menu_unsort"),
        columnMenuSortAsc: t("data_grid.column_menu_sort_asc"),
        columnMenuSortDesc: t("data_grid.column_menu_sort_desc"),
        columnMenuManagePivot: t("data_grid.column_menu_manage_pivot"),
        columnMenuManageCharts: t("data_grid.column_menu_manage_charts"),

        columnHeaderFiltersLabel: t("data_grid.column_header_filters_label"),
        columnHeaderSortIconLabel: t("data_grid.column_header_sort_icon_label"),

        // footerRowSelected: (count) =>
        //   count !== 1
        //     ? `${count.toLocaleString()} ${t("footer_row_selected", {count})}`
        //     : `${count.toLocaleString()} row selected`,
        footerRowSelected: (count) => t("data_grid.footer_row_selected", {count}),

        footerTotalRows: t("data_grid.footer_total_rows"),
        // Total visible row amount footer text
        footerTotalVisibleRows: (visibleCount, totalCount) =>
          `${visibleCount.toLocaleString()} ${t("of")} ${totalCount.toLocaleString()}`,


        checkboxSelectionHeaderName: t("data_grid.checkbox_selection_header_name"),
        checkboxSelectionSelectAllRows: t("data_grid.checkbox_selection_select_all_rows"),
        checkboxSelectionUnselectAllRows: t("data_grid.checkbox_selection_unselect_all_rows"),
        checkboxSelectionSelectRow: t("data_grid.checkbox_selection_select_row"),
        checkboxSelectionUnselectRow: t("data_grid.checkbox_selection_unselect_row"),

        booleanCellTrueLabel: t("data_grid.boolean_cell_true_label"),
        booleanCellFalseLabel: t("data_grid.boolean_cell_false_label"),

        actionsCellMore: t("data_grid.actions_cell_more"),

        pinToLeft: t("data_grid.pin_to_left"),
        pinToRight: t("data_grid.pin_to_right"),
        unpin: t("data_grid.unpin"),

        treeDataGroupingHeaderName: t("data_grid.tree_data_grouping_header_name"),
        treeDataExpand: t("data_grid.tree_data_expand"),
        treeDataCollapse: t("data_grid.tree_data_collapse"),

        groupingColumnHeaderName: t("data_grid.grouping_column_header_name"),

        detailPanelToggle: t("data_grid.detail_panel_toggle"),
        expandDetailPanel: t("data_grid.expand_detail_panel"),
        collapseDetailPanel: t("data_grid.collapse_detail_panel"),

        paginationRowsPerPage: t("data_grid.pagination_rows_per_page"),
        paginationDisplayedRows: ({ from, to, count, estimated }) => {
          if (!estimated) {
            return `${from}–${to} ${t("data_grid.of")} ${count !== -1 ? count : `${t("data_grid.more_than")} ${to}`}`;
          }
          const estimatedLabel = estimated && estimated > to ? `${t("data_grid.around")} ${estimated}` : `${t("data_grid.more_than")} ${to}`;
          return `${from}–${to} ${t("data_grid.of")} ${count !== -1 ? count : estimatedLabel}`;
        },

        rowReorderingHeaderName: t("data_grid.row_reordering_header_name"),

        aggregationMenuItemHeader: t("data_grid.aggregation_menu_item_header"),
        aggregationFunctionLabelNone: t("data_grid.aggregation_function_label_none"),
        aggregationFunctionLabelSum: t("data_grid.aggregation_function_label_sum"),
        aggregationFunctionLabelAvg: t("data_grid.aggregation_function_label_avg"),
        aggregationFunctionLabelMin: t("data_grid.aggregation_function_label_min"),
        aggregationFunctionLabelMax: t("data_grid.aggregation_function_label_max"),
        aggregationFunctionLabelSize: t("data_grid.aggregation_function_label_size"),

        pivotToggleLabel: t("data_grid.pivot_toggle_label"),
        pivotRows: t("data_grid.pivot_rows"),
        pivotColumns: t("data_grid.pivot_columns"),
        pivotValues: t("data_grid.pivot_values"),
        pivotCloseButton: t("data_grid.pivot_close_button"),
        pivotSearchButton: t("data_grid.pivot_search_button"),
        pivotSearchControlPlaceholder: t("data_grid.pivot_search_control_placeholder"),
        pivotSearchControlLabel: t("data_grid.pivot_search_control_label"),
        pivotSearchControlClear: t("data_grid.pivot_search_control_clear"),
        pivotNoFields: t("data_grid.pivot_no_fields"),
        pivotMenuMoveUp: t("data_grid.pivot_menu_move_up"),
        pivotMenuMoveDown: t("data_grid.pivot_menu_move_down"),
        pivotMenuMoveToTop: t("data_grid.pivot_menu_move_to_top"),
        pivotMenuMoveToBottom: t("data_grid.pivot_menu_move_to_bottom"),
        pivotMenuRows: t("data_grid.pivot_menu_rows"),
        pivotMenuColumns: t("data_grid.pivot_menu_columns"),
        pivotMenuValues: t("data_grid.pivot_menu_values"),
        pivotMenuOptions: t("data_grid.pivot_menu_options"),
        pivotMenuAddToRows: t("data_grid.pivot_menu_add_to_rows"),
        pivotMenuAddToColumns: t("data_grid.pivot_menu_add_to_columns"),
        pivotMenuAddToValues: t("data_grid.pivot_menu_add_to_values"),
        pivotMenuRemove: t("data_grid.pivot_menu_remove"),
        pivotDragToRows: t("data_grid.pivot_drag_to_rows"),
        pivotDragToColumns: t("data_grid.pivot_drag_to_columns"),
        pivotDragToValues: t("data_grid.pivot_drag_to_values"),
        pivotYearColumnHeaderName: t("data_grid.pivot_year_column_header_name"),
        pivotQuarterColumnHeaderName: t("data_grid.pivot_quarter_column_header_name"),

        chartsNoCharts: t("data_grid.charts_no_charts"),
        chartsChartNotSelected: t("data_grid.charts_chart_not_selected"),
        chartsTabChart: t("data_grid.charts_tab_chart"),
        chartsTabFields: t("data_grid.charts_tab_fields"),
        chartsTabCustomize: t("data_grid.charts_tab_customize"),
        chartsCloseButton: t("data_grid.charts_close_button"),
        chartsSyncButtonLabel: t("data_grid.charts_sync_button_label"),
        chartsSearchPlaceholder: t("data_grid.charts_search_placeholder"),
        chartsSearchLabel: t("data_grid.charts_search_label"),
        chartsSearchClear: t("data_grid.charts_search_clear"),
        chartsNoFields: t("data_grid.charts_no_fields"),
        chartsFieldBlocked: t("data_grid.charts_field_blocked"),
        chartsCategories: t("data_grid.charts_categories"),
        chartsSeries: t("data_grid.charts_series"),
        chartsMenuMoveUp: t("data_grid.charts_menu_move_up"),
        chartsMenuMoveDown: t("data_grid.charts_menu_move_down"),
        chartsMenuMoveToTop: t("data_grid.charts_menu_move_to_top"),
        chartsMenuMoveToBottom: t("data_grid.charts_menu_move_to_bottom"),
        chartsMenuOptions: t("data_grid.charts_menu_options"),
        chartsMenuRemove: t("data_grid.charts_menu_remove"),

        aiAssistantPanelTitle: t("data_grid.ai_assistant_panel_title"),
        aiAssistantPanelClose: t("data_grid.ai_assistant_panel_close"),
        aiAssistantPanelNewConversation: t("data_grid.ai_assistant_panel_new_conversation"),
        aiAssistantPanelConversationHistory: t("data_grid.ai_assistant_panel_conversation_history"),
        aiAssistantPanelEmptyConversation: t("data_grid.ai_assistant_panel_empty_conversation"),
        aiAssistantSuggestions: t("data_grid.ai_assistant_suggestions"),

        promptFieldLabel: t("data_grid.prompt_field_label"),
        promptFieldPlaceholder: t("data_grid.prompt_field_placeholder"),
        promptFieldPlaceholderWithRecording: t("data_grid.prompt_field_placeholder_with_recording"),
        promptFieldPlaceholderListening: t("data_grid.prompt_field_placeholder_listening"),
        promptFieldSpeechRecognitionNotSupported: t("data_grid.prompt_field_speech_recognition_not_supported"),
        promptFieldSend: t("data_grid.prompt_field_send"),
        promptFieldRecord: t("data_grid.prompt_field_record"),
        promptFieldStopRecording: t("data_grid.prompt_field_stop_recording"),

        promptRerun: t("data_grid.prompt_rerun"),
        promptProcessing: t("data_grid.prompt_processing"),
        promptAppliedChanges: t("data_grid.prompt_applied_changes"),
      }}
    />
  )
}

const EditButton:React.FC<IconButtonProps> = ({onClick, ...otherProps}) => {
  const {activeEditMode, setRows} = useCustomDataGrid();

  const handleCancel = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setRows((prev) => { 
      return [...prev as any];
    });
    onClick?.(event);
  }, [onClick])


  return !activeEditMode ? (
    <IconButton size='small' onClick={onClick} {...otherProps}>
      <EditIcon />
    </IconButton>
  ): (
    <IconButton size='small' onClick={handleCancel} {...otherProps}>  
      <CancelIcon />
    </IconButton>
  )
}

type DeleteButtonProps = Omit<IconButtonProps, "onClick"> & {
  onClick?: (e:React.MouseEvent<HTMLButtonElement, MouseEvent>, selectedRows: GridRowSelectionModel) => void
}
const DeleteButton:React.FC<DeleteButtonProps> = ({onClick, ...otherProps}) => {
  const {rows, activeEditMode, selectedRows} = useCustomDataGrid();
  const disabled = useMemo(() => {
    if(!rows) return true;
    if(selectedRows.type === "exclude")  {
      return selectedRows.ids.size === rows.length;
    }else {
      return selectedRows.ids.size === 0;
    }
  }, [rows, selectedRows])

  const handleClick = useCallback((e:any) => {
    onClick?.(e, selectedRows);
  }, [onClick, selectedRows])

  return activeEditMode && (
    <IconButton size='small' disabled={disabled} color='error' onClick={handleClick}  {...otherProps}>
      <DeleteIcon />
    </IconButton>
  )
}

type SaveButtonProps = Omit<IconButtonProps, "onClick"> & {
  onClick: (editedRows:Record<string, any>, event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const SaveButton:React.FC<SaveButtonProps> = ({onClick, ...otherProps}) => {
  const {editedRows, activeEditMode} = useCustomDataGrid();
  const disabled = useMemo(() => {
    return Object.keys(editedRows).length <= 0;
  }, [editedRows])

  const handleClick = useCallback((e:any) => {
    onClick?.(editedRows, e);
  }, [onClick, editedRows])

  return activeEditMode && (
    <IconButton size='small' color="success" disabled={disabled} onClick={handleClick} {...otherProps}>
      <SaveIcon />
    </IconButton>
  )
}

const RefreshButton:React.FC<IconButtonProps> = ({...otherProps}) => {

  return  (
    <IconButton size='small' {...otherProps}>
      <RefreshIcon />
    </IconButton>
  )
}

const SearchBar: React.FC = () => {
  const {t} = useTranslation();
  return (
    <QuickFilter>
      <QuickFilterControl
        render={({ ref, ...controlProps }, state) => (
          <TextField
            {...controlProps}
            inputRef={ref}
            aria-label="Search"
            placeholder={`${t("search")}...`}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: state.value ? (
                  <InputAdornment position="end">
                    <QuickFilterClear
                      edge="end"
                      size="small"
                      aria-label="Clear search"
                      material={{ sx: { marginRight: -0.75 } }}
                    >
                      <CancelIcon fontSize="small" />
                    </QuickFilterClear>
                  </InputAdornment>
                ) : null,
                ...controlProps.slotProps?.input,
              },
              ...controlProps.slotProps,
            }}
          />
        )}
      />
    </QuickFilter>
  )
}


const CustomDataGrid = {
  Root,
  Table,
  EditButton,
  DeleteButton,
  SaveButton,
  RefreshButton,
  SearchBar,
  Toolbar
}

export default CustomDataGrid