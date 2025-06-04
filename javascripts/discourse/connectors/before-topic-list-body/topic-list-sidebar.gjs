import Component from "@ember/component";
import { tagName } from "@ember-decorators/component";
import TopicListSidebar0 from "../../components/topic-list-sidebar";

@tagName("")
export default class TopicListSidebarConnector extends Component {
  <template>
    {{#unless this.site.mobileView}}
      <TopicListSidebar0 />
    {{/unless}}
  </template>
}
