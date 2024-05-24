import { module, test } from "qunit";
import migrate from "../../../../migrations/settings/0001-migrate-to-object";

module("Unit | Migrations | Settings | 0001-migrate-to-object", function () {
  test("migrate setup to sidebars with valid category IDs", async function (assert) {
    const settings = new Map(
      Object.entries({
        setup: "staff, 3|general, 5",
      })
    );

    const helpers = {
      getCategoryIdByName: (name) => {
        if (name === "staff") return 1;
        if (name === "general") return 2;
        return null;
      },
    };

    const result = migrate(settings, helpers);

    const expectedResult = new Map(
      Object.entries({
        sidebars: [
          { category: [1], name: "staff", tag: [], topic_id: 3 },
          { category: [2], name: "general", tag: [], topic_id: 5 },
        ],
      })
    );

    assert.deepEqual(
      Object.fromEntries(result.entries()),
      Object.fromEntries(expectedResult.entries())
    );
  });

  test("migrate setup with 'all' category", async function (assert) {
    const settings = new Map(
      Object.entries({
        setup: "all, 5|general, 3",
      })
    );

    const helpers = {
      getCategoryIdByName: (name) => {
        if (name === "general") return 2;
        return null;
      },
    };

    const result = migrate(settings, helpers);

    const expectedResult = new Map(
      Object.entries({
        sidebars: [
          { category: [], name: "all", tag: [], topic_id: 5 },
          { category: [2], name: "general", tag: [], topic_id: 3 },
        ],
      })
    );

    assert.deepEqual(
      Object.fromEntries(result.entries()),
      Object.fromEntries(expectedResult.entries())
    );
  });

  test("migrate setup with hyphenated category names", async function (assert) {
    const settings = new Map(
      Object.entries({
        setup: "site-feedback, 4|staff, 2",
      })
    );

    const helpers = {
      getCategoryIdByName: (name) => {
        if (name === "site feedback") return 1;
        if (name === "staff") return 2;
        return null;
      },
    };

    const result = migrate(settings, helpers);

    const expectedResult = new Map(
      Object.entries({
        sidebars: [
          { category: [1], name: "site feedback", tag: [], topic_id: 4 },
          { category: [2], name: "staff", tag: [], topic_id: 2 },
        ],
      })
    );

    assert.deepEqual(
      Object.fromEntries(result.entries()),
      Object.fromEntries(expectedResult.entries())
    );
  });
});
