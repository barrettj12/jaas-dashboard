import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { MemoryRouter, Route } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";

import { reduxStateFactory } from "testing/redux-factory";

import Model from "./Model";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

const mockStore = configureStore([]);

describe.skip("Model", () => {
  it("renders the info panel data", () => {
    const storeData = reduxStateFactory().build(
      {},
      {
        transient: {
          models: [{ name: "test", owner: "eggman@external" }],
        },
      }
    );
    const store = mockStore(storeData);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/test"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".entity-info__grid").length).toBe(1);
  });

  it("renders the main table", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/test"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".entity-details__main table").length).toBe(1);
  });

  it("view toggles hide and show tables", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    Element.prototype.scrollIntoView = jest.fn();

    expect(
      wrapper.find(".entity-details__main > .entity-details__apps").length
    ).toBe(1);
    wrapper
      .find(".p-tabs__link[data-test='tab-link-Machines']")
      .simulate("click");
    expect(
      wrapper.find(".entity-details__main > .entity-details__machines").length
    ).toBe(1);
    wrapper
      .find(".p-tabs__link[data-test='tab-link-Integrations']")
      .simulate("click");
    expect(
      wrapper.find(".entity-details__main > .entity-details__relations").length
    ).toBe(1);
    wrapper
      .find(".p-tabs__link[data-test='tab-link-Applications']")
      .simulate("click");
    expect(
      wrapper.find(".entity-details__main > .entity-details__apps").length
    ).toBe(1);
    wrapper
      .find(".p-tabs__link[data-test='tab-link-Action Logs']")
      .simulate("click");
    expect(wrapper.find("ActionLogs").length).toBe(1);
  });

  it("renders the details pane for models shared-with-me", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".entity-details__main table").length).toBe(1); // does this target correct table?
  });

  it("renders the machine details section", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/mymodel?activeView=machines",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find(".entity-details__main table")
        .hasClass("entity-details__machines")
    ).toBe(true);
  });

  it("supports local charms", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/user-eggman@external/local-test"]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find(".entity-details__apps tr[data-app='cockroachdb']").length
    ).toBe(1);
    expect(
      wrapper
        .find(
          ".entity-details__apps tr[data-app='cockroachdb'] td[data-test-column='store']"
        )
        .text()
    ).toBe("Local");
  });

  it("displays the correct scale value", () => {
    const store = mockStore(dataDump);
    const testApp = "client";
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const applicationRow = wrapper.find(`tr[data-app="${testApp}"]`);
    expect(applicationRow.find("td[data-test-column='scale']").text()).toBe(
      "1"
    );
  });

  it("should show a message if a model has no integrations", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/user-eggman@external/canonical-kubernetes?activeView=integrations",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    const noRelationsMsg = wrapper.find("[data-testid='no-integrations-msg']");
    expect(noRelationsMsg.length).toBe(1);
  });

  it("should show apps appropriate number of apps on machine in hadoopspark model", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/hadoopspark?activeView=machines",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const machineApps = wrapper.find(".machine-app-icons img");
    expect(machineApps.length).toBe(10);
  });

  it("should show apps appropriate number of apps on machine in canonical-kubernetes model", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/hadoopspark?activeView=machines",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    const machineAppIconRows = wrapper.find(".machine-app-icons");

    const machineApp1 = machineAppIconRows.at(1).find("img");
    expect(machineApp1.length).toBe(1);

    const machineApp4 = machineAppIconRows.at(4).find("img");
    expect(machineApp4.length).toBe(2);

    const machineApp6 = machineAppIconRows.at(6).find("img");
    expect(machineApp6.length).toBe(4);
  });

  it("renders the topology", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/user-eggman@external/group-test"]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Topology").exists()).toBe(true);
  });

  it("should have a link for model access panel", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/user-eggman@external/group-test"]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Route path="/models/:userName/:modelName?" element={<Model />} />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='model-access-btn']").exists()).toBe(true);
  });
});
