# frozen_string_literal: true

RSpec.describe "Tag sidebar", system: true do
  let!(:theme) { upload_theme_component }

  fab!(:tag)
  fab!(:topic_for_sidebar) { Fabricate(:post).topic }
  fab!(:tagged_topic) { Fabricate(:topic, tags: [tag]) }

  before do
    SiteSetting.tagging_enabled = true
    theme.update_setting(
      :sidebars,
      [{ "category" => [], "name" => "sidebar", "tag" => [tag.name], "topic_id" => topic_for_sidebar.id }]
    )
    theme.save!
  end

  it "displays sidebar on tag page" do
    visit("/tag/#{tag.name}")

    expect(page).to have_css(".category-sidebar")
    expect(page).to have_css("[data-tag-sidebar='#{tag.name}']")
  end
end
