import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { concat } from "@ember/helper";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { inject as service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";
import bodyClass from "discourse/helpers/body-class";
import { ajax } from "discourse/lib/ajax";
import Category from "discourse/models/category";

export default class CategorySidebar extends Component {
  @service router;
  @service siteSettings;
  @service site;
  @tracked sidebarContent = null;
  @tracked loading = true;

  <template>
    {{#if this.matchedSetting}}
      {{bodyClass "custom-sidebar"}}
      {{bodyClass (concat "sidebar-" settings.sidebar_side)}}
      <div
        class="category-sidebar"
        {{didInsert this.fetchPostContent}}
        {{didUpdate this.fetchPostContent this.category}}
      >
        <div class="sticky-sidebar">
          <div
            class="category-sidebar-contents category-sidebar-{{this.category.slug}}"
          >
            <div class="cooked">
              {{#unless this.loading}}
                {{htmlSafe this.sidebarContent}}
              {{/unless}}
              <ConditionalLoadingSpinner @condition={{this.loading}} />
            </div>
          </div>
        </div>
      </div>
    {{/if}}
  </template>

  get parsedSetting() {
    return settings.setup.split("|").reduce((result, setting) => {
      const [category, value] = setting.split(",").map((part) => part.trim());
      result[category] = { post: value };
      return result;
    }, {});
  }

  get isTopRoute() {
    const targets = this.siteSettings.top_menu
      .split("|")
      .map((opt) => `discovery.${opt}`);
    const filteredTargets = targets.filter(
      (item) => item !== "discovery.categories",
    );

    return (
      filteredTargets.includes(this.router.currentRouteName) &&
      this.site.desktopView
    );
  }

  get categorySlugPathWithID() {
    return this.router?.currentRoute?.params?.category_slug_path_with_id;
  }

  get category() {
    return this.categorySlugPathWithID
      ? Category.findBySlugPathWithID(this.categorySlugPathWithID)
      : null;
  }

  get matchedSetting() {
    if (this.parsedSetting["all"] && this.isTopRoute) {
      // if this is a top_menu route, use the "all" setting
      return this.parsedSetting["all"];
    } else if (this.categorySlugPathWithID) {
      const categorySlug = this.category.slug;
      const parentCategorySlug = this.category.parentCategory?.slug;

      // if there's a setting for this category, use it
      if (categorySlug && this.parsedSetting[categorySlug]) {
        return this.parsedSetting[categorySlug];
      }

      // if there's not a setting for this category
      // check the parent, and maybe use that
      if (
        settings.inherit_parent_sidebar &&
        parentCategorySlug &&
        this.parsedSetting[parentCategorySlug]
      ) {
        return this.parsedSetting[parentCategorySlug];
      }
    } else {
      return null;
    }
  }

  @action
  fetchPostContent() {
    this.loading = true;

    if (this.matchedSetting) {
      ajax(`/t/${this.matchedSetting.post}.json`).then((response) => {
        this.sidebarContent = response.post_stream.posts[0].cooked;
        this.loading = false;
      });
    }

    return this.sidebarContent;
  }
}
