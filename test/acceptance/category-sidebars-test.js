import { acceptance, visible } from "discourse/tests/helpers/qunit-helpers";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";

acceptance("Category Sidebars", function (needs) {
  needs.hooks.beforeEach(() => {
    settings.setup = "feature, 280";
  });

  test("Can see sidebar with cooked post", async function (assert) {
    await visit("/c/feature");
    assert.ok(visible(".category-sidebar"), "sidebar element is present");
    assert.ok(visible(".category-sidebar .cooked"), "cooked post");
    const cooked = document.querySelector(".category-sidebar .cooked");
    assert.strictEqual(
      cooked.innerText,
      "Any plans to support localization of UI elements, so that I (for example) could set up a completely German speaking forum?",
      "cooked post text is correct"
    );
  });
});
