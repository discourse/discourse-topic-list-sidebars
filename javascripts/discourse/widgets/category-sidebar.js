import { getOwner } from "discourse-common/lib/get-owner";
import { ajax } from "discourse/lib/ajax";
import PostCooked from "discourse/widgets/post-cooked";
import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";

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

function createSidebar(taxonomy, isCategory) {
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

function createDetailsSidebar(taxonomy, isCategory) {
  const setup = isCategory ? setupsByCategoryId[taxonomy] : setupsDetails[taxonomy];
  const post = [this.getPost(setup["post"])];

  return h(
    "div.category-sidebar-contents " + ".category-sidebar-" + taxonomy,
    post
  );
}

function checkActiveItem(detailId) {
  const activeItem = document.querySelector("li a.active");

    if (activeItem) {
      activeItem.classList.remove("active");
      if (activeItem.closest("details")) {
        activeItem.closest("details").open = false;
      }
    }
    const currentSidebarItem = document.querySelector("li a[href*='" + detailId + "']:not(.active)");
    if (currentSidebarItem) {
      currentSidebarItem.classList.add("active");
      if (currentSidebarItem.closest("details")) {
        currentSidebarItem.closest("details").setAttribute("open", "");
      }
    }
}

const postCache = {};
const setups = parseSetups(settings.setup);
const setupsDetails = parseSetups(settings.setupDetails);
const setupsByCategoryId = parseSetups(settings.setup_by_category_id);

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
      sidebarWrapper.style.top = settings.stick_on_scroll ? sidebarTop : undefined;
    }
  },

  html() {
    const router = getOwner(this).lookup("router:main");
    const currentRouteParams = router.currentRoute.params;
    const isCategoryTopicList = currentRouteParams.hasOwnProperty(
      "category_slug_path_with_id"
    );
    let previousURL = '';

    new MutationObserver(() => {
      if (location.href !== previousURL && (/\/t\//.test(location.href))) {
        previousURL = location.href;
        const detailsRouter = getOwner(this).lookup("router:main");
        console.log(detailsRouter);
        const detailsCurrentRouter = detailsRouter.currentRoute.parent.params;
        const detailsCurrentCategoryId = detailsRouter.currentRoute?.parent?.attributes?.category_id || 0;
        console.log(detailsCurrentCategoryId, 'id');
        const isDetailTopic = detailsCurrentRouter.hasOwnProperty(
          "slug"
        );

        if (detailsCurrentRouter) {
          checkActiveItem(detailsCurrentRouter.id);
        }

        if (setupsDetails["all"] && !isDetailTopic) {
          return createcreateDetailsSidebarSidebar.call(this, "all", false);
        } else if (isDetailTopic) {
          console.log('details');
          const detailsSlug = detailsCurrentRouter.slug;
          if (detailsSlug && setupsDetails[detailsSlug]) {
            return createDetailsSidebar.call(this, detailsSlug, false);
          } else if (detailsCurrentCategoryId && setupsByCategoryId[detailsCurrentCategoryId]) {
            console.log('category');
            return createDetailsSidebar.call(this, detailsCurrentCategoryId, true);
          }
        }
      }
    }).observe(document.querySelector("body"), {
      childList: true,
      subtree: true
    });


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
      .querySelector(".topic-list")
      .classList.remove("with-sidebar", settings.sidebar_side);
  },

  getPost(id) {
    if (!postCache[id]) {
      ajax(`/t/${id}.json`).then((response) => {
        postCache[id] = new PostCooked({
          cooked: response.post_stream.posts[0].cooked,
        });
        this.scheduleRerender();
      });
    }
    return postCache[id];
  },
});
