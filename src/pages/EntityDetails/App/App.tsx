import { useMemo, useRef } from "react";
import { Formik, Field } from "formik";
import { useParams } from "react-router-dom";
import {
  useQueryParam,
  useQueryParams,
  StringParam,
  withDefault,
} from "use-query-params";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import InfoPanel from "components/InfoPanel/InfoPanel";
import EntityInfo from "components/EntityInfo/EntityInfo";
import ChipGroup from "components/ChipGroup/ChipGroup";
import FormikFormData from "components/FormikFormData/FormikFormData";

import EntityDetails from "pages/EntityDetails/EntityDetails";

import useModelStatus from "hooks/useModelStatus";
import useTableRowClick from "hooks/useTableRowClick";

import {
  extractRevisionNumber,
  generateStatusElement,
  filterModelStatusDataByApp,
} from "app/utils/utils";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { SetFieldValue } from "components/FormikFormData/FormikFormData";
import type { TSFixMe } from "types";

import { generateMachineRows, generateUnitRows } from "tables/tableRows";
import {
  machineTableHeaders,
  generateSelectableUnitTableHeaders,
} from "tables/tableHeaders";

import { renderCounts } from "../counts";

type FormData = {
  selectAll: boolean;
  selectedUnits: string[];
};

export default function App(): JSX.Element {
  const { appName: entity } = useParams<EntityDetailsRoute>();

  const tablesRef = useRef<HTMLDivElement>(null);
  const setFieldsValues = useRef<SetFieldValue>();
  const selectedUnits = useRef<string[]>([]);
  const selectAll = useRef<boolean>(false);
  // Get model status info
  const modelStatusData: TSFixMe = useModelStatus();

  const tableRowClick = useTableRowClick();

  // Filter model status via selected entity
  const filteredModelStatusData = filterModelStatusDataByApp(
    modelStatusData,
    entity
  );

  const app = modelStatusData?.applications[entity];

  const machinesPanelRows = useMemo(
    () => generateMachineRows(filteredModelStatusData, tableRowClick),
    [filteredModelStatusData, tableRowClick]
  );

  const unitTableHeaders = useMemo(() => {
    const fieldID = "unit-list-select-all";
    return generateSelectableUnitTableHeaders({
      content: (
        <label className="p-checkbox" htmlFor={fieldID}>
          <Field
            id={fieldID}
            type="checkbox"
            aria-labelledby="checkboxLabel0"
            className="p-checkbox__input"
            name="selectAll"
          />
          <span className="p-checkbox__label" id="checkboxLabel0"></span>
        </label>
      ),
      sortKey: "",
      className: "select-unit",
    });
  }, []);

  const unitPanelRows = useMemo(
    () => generateUnitRows(filteredModelStatusData, tableRowClick, true),
    [filteredModelStatusData, tableRowClick]
  );

  const [tableView, setTableView] = useQueryParam(
    "tableview",
    withDefault(StringParam, "units")
  );

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });

  const showConfig = () => {
    query && setQuery({ panel: "config", entity: entity });
  };

  const AppEntityData = {
    status:
      app && app.status?.status
        ? generateStatusElement(app.status.status)
        : "-",
    charm: app?.charm,
    os: "Ubuntu",
    revision: (app && extractRevisionNumber(app.charm)) || "-",
    message: "-",
  };

  const unitChips = renderCounts("units", modelStatusData);
  const machineChips = renderCounts("machines", modelStatusData);

  const setPanel = useQueryParam("panel", StringParam)[1];
  const showActions = () => {
    setPanel("execute-action");
  };

  const onFormChange = (formData: FormData) => {
    if (!setFieldsValues.current) return;
    const unitList = Object.keys(app.units);

    // Handle the selectALl checkbox interactions.
    if (selectAll.current && !formData.selectAll) {
      if (selectedUnits.current.length === unitList.length) {
        // Only reset them all to unchecked if they were all checked to
        // begin with. This is to fix the issue when you uncheck one unit
        // and it changes the selectAll button.
        setFieldsValues.current("selectedUnits", []);
      }
    } else if (!selectAll.current && formData.selectAll) {
      // The user has switched the selectAll checkbox from unchecked to checked.
      setFieldsValues.current("selectedUnits", unitList);
    }
    selectAll.current = formData.selectAll;

    // Handle the unit checkbox interactions.
    if (
      selectedUnits.current.length !== unitList.length &&
      formData.selectedUnits.length === unitList.length
    ) {
      // If the user has checked all of the unit checkboxes.
      setFieldsValues.current("selectAll", true);
    } else if (
      selectedUnits.current.length === unitList.length &&
      formData.selectedUnits.length !== unitList.length
    ) {
      // If the user has unchecked some of the unit checkboxes.
      setFieldsValues.current("selectAll", false);
    }
    selectedUnits.current = formData.selectedUnits;
  };

  const onSetup = (setFieldValue: SetFieldValue) => {
    setFieldsValues.current = setFieldValue;
  };

  return (
    <EntityDetails type="app" className="entity-details__app">
      <div>
        <InfoPanel />
        <>
          <div className="entity-details__actions">
            <button
              className="entity-details__action-button"
              onClick={showConfig}
            >
              <i className="p-icon--settings"></i>Configure
            </button>

            <button
              className="entity-details__action-button"
              onClick={showActions}
            >
              <i className="p-icon--settings"></i>Actions
            </button>
          </div>
          <EntityInfo data={AppEntityData} />
        </>
      </div>
      <div className="entity-details__main u-overflow--scroll">
        <ButtonGroup
          buttons={["units", "machines"]}
          activeButton={tableView}
          setActiveButton={setTableView}
        />
        <div className="entity-details__tables" ref={tablesRef}>
          {tableView === "units" && (
            <>
              <ChipGroup chips={unitChips} descriptor="units" />
              <Formik
                initialValues={{
                  selectAll: false,
                  selectedUnits: [],
                }}
                onSubmit={() => {}}
              >
                <FormikFormData onFormChange={onFormChange} onSetup={onSetup}>
                  <MainTable
                    headers={unitTableHeaders}
                    rows={unitPanelRows}
                    className="entity-details__units p-main-table panel__table"
                    sortable
                    emptyStateMsg={"There are no units in this model"}
                  />
                </FormikFormData>
              </Formik>
            </>
          )}
          {tableView === "machines" && (
            <>
              <ChipGroup chips={machineChips} descriptor="machines" />
              <MainTable
                headers={machineTableHeaders}
                rows={machinesPanelRows}
                className="entity-details__machines p-main-table panel__table"
                sortable
                emptyStateMsg={"There are no machines in this model"}
              />
            </>
          )}
        </div>
      </div>
    </EntityDetails>
  );
}
