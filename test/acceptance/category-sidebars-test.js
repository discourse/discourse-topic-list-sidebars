import { visit, waitFor } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("CategorySidebar - General", function () {
  test("Sidebar appears based on matching setting", async function (assert) {
    settings.setup = "bug, 280";

    await visit("/c/bug");

    assert.dom(".category-sidebar").exists("the sidebar should appear");
  });

  test("Sidebar appears based on all setting", async function (assert) {
    settings.setup = "all, 280";

    await visit("/latest");

    assert.dom(".category-sidebar").exists("the sidebar should appear");
  });

  test("Sidebar does not appear when no matching setting", async function (assert) {
    settings.setup = "foo, 280";

    await visit("/c/bug");

    assert
      .dom(".category-sidebar")
      .doesNotExist("the sidebar should not appear");
  });

  test("Sidebar content is displayed", async function (assert) {
    settings.setup = "bug, 280";

    await visit("/c/bug");

    await waitFor(".cooked", {
      timeout: 5000,
    });

    assert.dom(".cooked").hasText(/German/, "the sidebar should have content");
  });
});
