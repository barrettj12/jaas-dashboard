import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import cloneDeep from "clone-deep";

import { waitForComponentToPaint } from "testing/utils";
import dataDump from "testing/complete-redux-store-dump";

import App from "./App";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe.skip("Entity Details App", () => {
  async function generateComponent(data = dataDump) {
    const store = mockStore(data);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/user-island@external/canonical-kubernetes/app/etcd",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName/app/:appName"
                element={<App />}
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    await waitForComponentToPaint(wrapper);
    return wrapper;
  }

  async function generateRoutableComponent() {
    const store = mockStore(dataDump);

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/user-island@external/canonical-kubernetes/app/etcd",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName/app/:appName"
                element={<App />}
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    await waitForComponentToPaint(wrapper);
    return { wrapper };
  }

  it("renders the info panel", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("InfoPanel").exists()).toBe(true);
  });

  it("allows you to switch between a unit and machines view", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find('table[data-test="units-table"]').length).toBe(1);
    expect(wrapper.find('table[data-test="machines-table"]').length).toBe(0);
    wrapper.find('button[value="machines"]').simulate("click", {});
    expect(wrapper.find('table[data-test="units-table"]').length).toBe(0);
    expect(wrapper.find('table[data-test="machines-table"]').length).toBe(1);
  });

  it("supports selecting and deselecting all units", async () => {
    const wrapper = await generateComponent();

    const findSelectAll = () => wrapper.find('input[name="selectAll"]');
    const findSelectedUnits = () => wrapper.find('input[name="selectedUnits"]');
    const simulateSelectAllChange = async (value) => {
      findSelectAll().simulate("change", {
        target: { name: "selectAll", value },
      });
      await waitForComponentToPaint(wrapper);
    };
    const unitsListChecked = (value) => {
      findSelectedUnits().forEach((input) => {
        expect(input.prop("checked")).toBe(value);
      });
    };
    const selectAllChecked = (value) => {
      expect(findSelectAll().prop("checked")).toBe(value);
    };

    // All units get selected when clicking selectAll
    selectAllChecked(false);
    unitsListChecked(false);
    await simulateSelectAllChange(true);
    unitsListChecked(true);
    selectAllChecked(true);

    // All units get de-selected when clicking selectAll
    await simulateSelectAllChange(false);
    unitsListChecked(false);

    // Selecting all units selects the selectAll checkbox
    const unitIds = findSelectedUnits().map((input) => input.prop("value"));
    findSelectedUnits()
      .at(0)
      .simulate("change", {
        target: {
          name: "selectedUnits",
          value: unitIds,
        },
      });
    await waitForComponentToPaint(wrapper);
    selectAllChecked(true);

    // De-selecting one unit de-selects the selectAll checkbox
    const firstInput = findSelectedUnits().at(0);
    firstInput.simulate("change", {
      target: { name: "selectedUnits", value: firstInput.prop("value") },
    });
    await waitForComponentToPaint(wrapper);
    selectAllChecked(false);

    // Clickcing selectAll with partial units selected, selects all
    await simulateSelectAllChange(true);
    unitsListChecked(true);
    selectAllChecked(true);

    // De-selecting the selectAll deselects all the units.
    await simulateSelectAllChange(false);
    unitsListChecked(false);
  });

  it("enable the action button row when a unit is selected", async () => {
    const wrapper = await generateComponent();
    const findActionButton = () =>
      wrapper.find('button[data-test="run-action-button"]');
    const findSelectedUnits = () => wrapper.find('input[name="selectedUnits"]');
    expect(findActionButton().prop("disabled")).toBe(true);
    const firstInput = findSelectedUnits().at(0);
    firstInput.simulate("change", {
      target: { name: "selectedUnits", value: firstInput.prop("value") },
    });
    await waitForComponentToPaint(wrapper);
    expect(findActionButton().prop("disabled")).toBe(false);
  });

  it("updates the url when units are selected and deselected", async () => {
    const { wrapper, history } = await generateRoutableComponent();

    const findActionButton = () =>
      wrapper.find('button[data-test="run-action-button"]');
    const findSelectedUnits = () => wrapper.find('input[name="selectedUnits"]');

    // Select a single unit.
    const firstInput = findSelectedUnits().at(0);
    firstInput.simulate("change", {
      target: { name: "selectedUnits", value: firstInput.prop("value") },
    });
    await waitForComponentToPaint(wrapper);

    // Trigger the action panel to open to enable the auto url pushing.
    findActionButton().simulate("click", {});
    await waitForComponentToPaint(wrapper);
    expect(history.location.query).toEqual({
      panel: "execute-action",
      units: "etcd/0",
    });

    // Select another unit and it should update the url.
    const secondInput = findSelectedUnits().at(1);
    secondInput.simulate("change", {
      target: {
        name: "selectedUnits",
        value: [firstInput.prop("value"), secondInput.prop("value")],
      },
    });
    await waitForComponentToPaint(wrapper);

    expect(history.location.query).toEqual({
      panel: "execute-action",
      units: ["etcd/0", "etcd/1"],
    });
  });

  it("navigates to the actions log when button pressed", async () => {
    const { wrapper, history } = await generateRoutableComponent();
    wrapper.find('Button[data-test="show-action-logs"]').simulate("click", {});
    await waitForComponentToPaint(wrapper);
    expect(history.location.search).toBe("?activeView=action-logs");
  });

  it("does not fail if a subordiante is not related to another application", async () => {
    const tweakedData = cloneDeep(dataDump);
    tweakedData.juju.modelData[
      "e1e81a64-3385-4779-8643-05e3d5fake23"
    ].applications.etcd.units = null;
    const wrapper = await generateComponent(tweakedData);
    expect(wrapper.find("MainTable caption").text()).toBe(
      "There are no units in this application"
    );
  });
});
