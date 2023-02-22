import { getOwner } from "discourse-common/lib/get-owner";
import { ajax } from "discourse/lib/ajax";
import DecoratorHelper from "discourse/widgets/decorator-helper";
import PostCooked from "discourse/widgets/post-cooked";
import RawHtml from "discourse/widgets/raw-html";
import { createWidget } from "discourse/widgets/widget";

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
  const setup = isCategory ? setupByCategory[taxonomy] : setups[taxonomy];
  const post = [this.getPost(setup["post"])];
  this.state.posts = post;

  if (!this.state.posts || !this.state.posts[0]?.attrs?.cooked) {
    return;
  }

  return new RawHtml({
    html: `<div class="category-sidebar-contents category-sidebar-${taxonomy} cooked">${this.state.posts[0].attrs.cooked}</div>`
  });
}

const postCache = {};
const topicInsideParent = {};
const setups = parseSetups(settings.setupDetails);
const setupByCategory = parseSetups(settings.setup_by_category_id);

createWidget("details-sidebar", {
  tagName: "div.sticky-sidebar",
  buildKey: () => "details-sidebar",

  defaultState() {
    return { posts: null };
  },

  init() {
    let sidebarWrapper =
      document.getElementsByClassName("category-sidebar")[0] || 0;
    let headerHeight =
      document.getElementsByClassName("d-header-wrap")[0].offsetHeight || 0;
    let sidebarTop = headerHeight + 20 + "px";
    let hasSidebarPage = document.getElementsByClassName("has-sidebar-page")[0] || 0;
    let sidebarMaxHeight = "calc(100vh - " + (headerHeight + 40) + "px)";
    if (sidebarWrapper && !hasSidebarPage) {
      sidebarWrapper.style.maxHeight = sidebarMaxHeight;
      sidebarWrapper.style.top = settings.stick_on_scroll ? sidebarTop : undefined;
      sidebarWrapper.style.position = settings.stick_on_scroll ? "sticky" : "";
    }

    document
      .querySelector("body")
      .classList.add("custom-sidebar", "sidebar-" + settings.sidebar_side);
    document
      .querySelector("#main-outlet > .container+div")
      .classList.add("with-sidebar", settings.sidebar_side);
  },

  html() {
    const router = getOwner(this).lookup("router:main");
    const currentRouteParams = router.currentRoute.parent.params;
    const currentCategoryId = router.currentRoute?.parent?.attributes?.category_id || 0;
    const isDetailTopic = currentRouteParams.hasOwnProperty(
      "slug"
    );

    let prevURL = "";

    const observer = new MutationObserver(() => {
      if (location.href !== prevURL && (/\/t\//.test(location.href))) {
        prevURL = location.href;
        this.scheduleRerender();
        const rt = getOwner(this).lookup("router:main");
        const currentRT = rt.currentRoute.parent.params;
        const activeItem = document.querySelector("li a.active:not(.sidebar-section-link)");

        const sidebar = document.querySelector(".sidebar-sections");
        const customSidebar = document.querySelector(".sidebar-sections .cooked");

        if (customSidebar && !this?.state?.posts) {
          customSidebar.remove();
        }

        if (sidebar && !customSidebar && this.state?.posts && this.state.posts[0]?.attrs?.cooked) {
          const wrapper = document.createElement("div");

          wrapper.className = "cooked";
          wrapper.innerHTML = this.state.posts[0].attrs.cooked;

          sidebar.innerHTML += wrapper.outerHTML;
        }
        if (sidebar && customSidebar && this.state?.posts && this.state.posts[0]?.attrs?.cooked) {
          customSidebar.innerHTML = this.state.posts[0].attrs.cooked;
        }

        if (activeItem) {
          activeItem.classList.remove("active");
          const parent = activeItem.closest("details");
          const grandParent = parent ? parent.parentNode : null;
          const greatGrandParent = grandParent ? grandParent.parentNode : null;

          if (parent && !grandParent) {
            parent.open = false;
          }
          if (parent && grandParent) {
            parent.open = false;
            grandParent.open = false;
          }
          if (parent && grandParent && greatGrandParent) {
            parent.open = false;
            grandParent.open = false;
            greatGrandParent.open = false;
          }
        }
        const currentSidebarItem = document.querySelector(
          "li a[href*='" + currentRT.id + "']:not(.active):not(.sidebar-section-link)"
        );
        if (currentSidebarItem) {
          currentSidebarItem.classList.add("active");
          const parent = currentSidebarItem.closest("details");
          const grandParent = parent ? parent.parentNode : null;
          const greatGrandParent = grandParent ? grandParent.parentNode : null;

          if (parent && !grandParent) {
            parent.open = true;
          }
          if (parent && grandParent) {
            parent.open = true;
            grandParent.open = true;
          }
          if (parent && grandParent && greatGrandParent) {
            parent.open = true;
            grandParent.open = true;
            greatGrandParent.open = true;
          }
        }
      }
    });

    const topicBody = document.getElementById("main-outlet");
    observer.observe(topicBody, { childList: true, subtree: true });

    if (setups["all"] && !isDetailTopic) {
      return createSidebar.call(this, "all");
    } else if (isDetailTopic) {
      const detailsSlug = currentRouteParams.slug

      if (detailsSlug && setups[detailsSlug]) {
        return createSidebar.call(this, detailsSlug, false);
      } else if (currentCategoryId && setupByCategory[currentCategoryId]) {
        return createSidebar.call(this, currentCategoryId, true);
      } else if (settings.inherit_parent_sidebar) {
        Object.keys(setupByCategory).map((category) => {
          if (category === currentCategoryId.toString()) {
            return createSidebar.call(this, category, true);
          }

          document
            .querySelector("body")
            .classList.remove("custom-sidebar", "sidebar-" + settings.sidebar_side);
          document
            .querySelector("#main-outlet > .container+div")
            .classList.remove("with-sidebar", settings.sidebar_side);
        });
      }
    }
  },

  getPost(id) {
    if (!postCache[id]) {
      ajax(`/t/${id}.json`).then((response) => {
        this.model = response.post_stream.posts[0];
        this.model.topic = response;

        postCache[id] = new PostCooked({
          cooked: response.post_stream.posts[0].cooked,
        },
        new DecoratorHelper(this),
        this.currentUser);
        this.scheduleRerender();
      });
    }
    return postCache[id];
  },

  isPostExistFromParent(id, postId) {
    if (id && postId) {
      ajax(`/c/${id}.json`).then((response) => {
        topicInsideParent[id] = response?.topic_list?.topics.some((topic) => topic.id === postId);
      });
    }
  }
});