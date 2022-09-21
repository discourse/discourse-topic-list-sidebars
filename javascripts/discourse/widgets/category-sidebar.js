import { ajax } from "discourse/lib/ajax";
import { createWidget } from "discourse/widgets/widget";
import { getOwner } from "discourse-common/lib/get-owner";
import { h } from "virtual-dom";
import PostCooked from "discourse/widgets/post-cooked";
import DecoratorHelper from "discourse/widgets/decorator-helper";

function defaultSettings() {
  return {};
}

function parseSetups(raw) {
  const parsed = {};
  raw.split("|").forEach((setting) => {
    const [category, value] = setting.split(",").map((s) => s.trim());
    parsed[category] = parsed[category] || defaultSettings();
    parsed[category]["post"] = value;
  });
  return parsed;
}

function createSidebar(taxonomy) {
  const setup = setups[taxonomy];
  const post = [this.getPost(setup["post"])];

  document
    .querySelector("body")
    .classList.add("custom-sidebar", "sidebar-" + settings.sidebar_side);
  document
    .querySelector(".topic-list")
    .classList.add("with-sidebar", settings.sidebar_side);

  return h(
    "div.category-sidebar-contents " + ".category-sidebar-" + taxonomy,
    post
  );
}

const postCache = {};
const setups = parseSetups(settings.setup);

createWidget("category-sidebar", {
  tagName: "div.sticky-sidebar",

  init() {
    let sidebarWrapper =
      document.getElementsByClassName("category-sidebar")[0] || 0;
    let headerHeight =
      document.getElementsByClassName("d-header-wrap")[0].offsetHeight || 0;
    let sidebarTop = headerHeight + 20 + "px";
    let sidebarMaxHeight = "calc(100vh - " + (headerHeight + 40) + "px)";
    if (sidebarWrapper) {
      sidebarWrapper.style.maxHeight = sidebarMaxHeight;
      sidebarWrapper.style.top = sidebarTop;
    }
  },

  html() {
    const router = getOwner(this).lookup("router:main");
    const currentRouteParams = router.currentRoute.params;
    const isCategoryTopicList = currentRouteParams.hasOwnProperty(
      "category_slug_path_with_id"
    );

    if (setups["all"] && !isCategoryTopicList) {
      return createSidebar.call(this, "all");
    } else if (isCategoryTopicList) {
      const categorySlugPath =
        currentRouteParams.category_slug_path_with_id.split("/");
      const categorySlug = categorySlugPath[0];
      const subcategorySlug = categorySlugPath[categorySlugPath.length - 2];

      // If set, show category sidebar

      if (categorySlug && !subcategorySlug && setups[categorySlug]) {
        return createSidebar.call(this, categorySlug);
      }

      // If set, show subcategory sidebar

      if (subcategorySlug && setups[subcategorySlug]) {
        return createSidebar.call(this, subcategorySlug);
      }

      // if set, subcategory without its own sidebar will inherit parent category's sidebar

      if (
        subcategorySlug &&
        !setups[subcategorySlug] &&
        setups[categorySlug] &&
        settings.inherit_parent_sidebar
      ) {
        return createSidebar.call(this, categorySlug);
      }
    }
    // Remove classes if no sidebar returned
    document
      .querySelector("body")
      .classList.remove("custom-sidebar", "sidebar-" + settings.sidebar_side);
    document
      .querySelector(".topic-list")
      .classList.remove("with-sidebar", settings.sidebar_side);
  },

  getPost(id) {
    if (!postCache[id]) {
      ajax(`/t/${id}.json`).then((response) => {
        this.model = response.post_stream.posts[0];
        postCache[id] = new PostCooked(
          {
            cooked: response.post_stream.posts[0].cooked,
          },
          new DecoratorHelper(this),
          this.currentUser
        );
        this.scheduleRerender();
      });
    }
    return postCache[id];
  },
});
