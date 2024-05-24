import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { concat } from "@ember/helper";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";
import bodyClass from "discourse/helpers/body-class";
import { ajax } from "discourse/lib/ajax";
import { cached } from "@glimmer/tracking";

export default class TopicListSidebar extends Component {
  @service router;
  @service siteSettings;
  @service site;

  @tracked sidebarContent;
  @tracked loading = true;

  findName(name) {
    return settings.sidebars.filter((setting) => setting.name === name);
  }

  findCategory(categoryId) {
    return settings.sidebars.filter((setting) => setting.category?.includes(categoryId));
  }

  findTag(tagName) {
    return settings.sidebars.filter((setting) => setting.tag?.includes(tagName));
  }

  get isTopRoute() {
    const topMenu = this.siteSettings.top_menu;

    if (!topMenu) {
      return false;
    }

    const targets = topMenu.split("|").map((opt) => `discovery.${opt}`);
    const filteredTargets = targets.filter(
      (item) => item !== "discovery.categories"
    );

    return filteredTargets.includes(this.router.currentRouteName);
  }

  get categorySlugPathWithID() {
    return this.router?.currentRoute?.params?.category_slug_path_with_id;
  }

  get tagId() {
    return this.router?.currentRoute?.params?.tag_id;
  }

  get matchedSetting() {
    const categoryId = this.category?.id;
    const parentCategoryId = this.category?.parentCategory?.id;
    const tagId = this.tagId;

    let result = null;

    if (this.findName("all") && this.isTopRoute) {
      result = this.findName("all");
    } 
    
    if (categoryId) {
      if (
        settings.inherit_parent_sidebar &&
        parentCategoryId &&
        this.findCategory(parentCategoryId).length
      ) {
        result = this.findCategory(parentCategoryId);
      }
      if (this.findCategory(categoryId).length) {
        result = this.findCategory(categoryId);
      }
    } 
    
    if (tagId) {
      result = this.findTag(tagId);
    } 

    return result;
  }

   @cached
  get category() {
    return (
      this.router.currentRoute.attributes.category ||
      this.topic?.get("category")
    );
  }

  @action
  async fetchPostContent() {
    this.loading = true;

    // if multiple, use the last matching setting
    const [lastSetting] = [...this.matchedSetting].reverse();
    const topicId = lastSetting.topic_id;

    try {
      if (this.matchedSetting) {
        const response = await ajax(`/t/${topicId}.json`);
        this.sidebarContent = response.post_stream.posts[0].cooked;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching post for sidebar:", error);
    } finally {
      this.loading = false;
    }

    return this.sidebarContent;
  }

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
            class="category-sidebar-contents"
            data-category-sidebar={{this.category.slug}}
            data-tag-sidebar={{this.tagId}}
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
}
