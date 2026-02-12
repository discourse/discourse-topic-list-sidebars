# frozen_string_literal: true

module PageObjects
  module Components
    class TopicListSidebar < PageObjects::Components::Base
      SELECTOR = ".category-sidebar"

      def has_tag_sidebar?(tag)
        has_css?("#{SELECTOR} [data-tag-sidebar='#{tag.name}']")
      end
    end
  end
end
