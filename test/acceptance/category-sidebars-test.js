import { visit, waitFor } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("CategorySidebar - General", function () {
  test("Sidebar appears based on matching setting", async function (assert) {
    settings.sidebars = [
      { category: [1], name: "bug", tag: [], topic_id: 280 },
    ];

    await visit("/c/bug");

    assert.dom(".category-sidebar").exists("the sidebar should appear");
  });

  test("Sidebar appears based on all setting", async function (assert) {
    settings.sidebars = [{ category: [], name: "all", tag: [], topic_id: 280 }];

    await visit("/latest");

    assert.dom(".category-sidebar").exists("the sidebar should appear");
  });

  test("Sidebar does not appear when no matching setting", async function (assert) {
    settings.sidebars = [
      { category: [2], name: "foo", tag: [], topic_id: 280 },
    ];

    await visit("/c/bug");

    assert
      .dom(".category-sidebar")
      .doesNotExist("the sidebar should not appear");
  });

  test("Sidebar content is displayed", async function (assert) {
    settings.sidebars = [
      { category: [1], name: "bug", tag: [], topic_id: 280 },
    ];

    await visit("/c/bug");

    await waitFor(".cooked", {
      timeout: 5000,
    });

    assert.dom(".cooked").hasText(/German/, "the sidebar should have content");
  });

  test("Sidebar appears based on tag setting", async function (assert) {
    settings.sidebars = [
      { category: [], name: "sidebar", tag: ["important"], topic_id: 280 },
    ];

    await visit("/tag/important");

    assert.dom(".category-sidebar").exists("the sidebar should appear");
  });
});
