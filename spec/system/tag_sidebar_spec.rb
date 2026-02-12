# frozen_string_literal: true

require_relative "page_objects/components/topic_list_sidebar"

RSpec.describe "Tag sidebar", system: true do
  let!(:theme) { upload_theme_component }

  fab!(:tag)
  fab!(:topic_for_sidebar) { Fabricate(:post).topic }
  fab!(:tagged_topic) { Fabricate(:topic, tags: [tag]) }

  let(:sidebar) { PageObjects::Components::TopicListSidebar.new }

  before { SiteSetting.tagging_enabled = true }

  it "displays sidebar on default and filtered tag pages" do
    theme.update_setting(
      :sidebars,
      [
        {
          "category" => [],
          "name" => "sidebar",
          "tag" => [tag.name],
          "topic_id" => topic_for_sidebar.id,
        },
      ],
    )
    theme.save!

    visit(tag.url)
    expect(sidebar).to have_tag_sidebar(tag)

    visit("#{tag.url}/l/latest")
    expect(sidebar).to have_tag_sidebar(tag)
  end
end
