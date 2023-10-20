# discourse-category-sidebars

This theme component takes a topic and applies it as a sidebar for a category's topic list. These sidebars are only visible when the browser is 767px or wider (most tablets and monitors).

![image](https://user-images.githubusercontent.com/5862206/214492836-6dcb5dde-d0cf-4ee8-9811-2cf135b95c7b.png)

:eye: [Preview it on theme creator](https://theme-creator.discourse.org/theme/awesomerobot/discourse-category-sidebars)

:thinking: https://meta.discourse.org/t/how-do-i-install-a-theme-or-theme-component/63682

## What can I do with this theme component?

- Choose a topic and display its content as a sidebar for a category.

- Set a sidebar to be displayed on the /latest, /new, /unread, and /top pages by using `all` as the category name in your settings.

- Choose for the sidebars to appear on the left or the right of the topic list.

- By default a category's sidebar will also display for all its subcategories unless a subcategory has its own sidebar defined (you can disable this by unchecking the `inherit parent sidebar` setting).

## How do I configure it?

Simply insert the category slug (from the category url, e.g. [example.com/c/](#)**staff**) and the id of the topic (e.g. [example.com/t/example-topic/](#)**57**)

![image](https://user-images.githubusercontent.com/5862206/214492886-e5c35808-6c82-4ade-8eed-062c70851d7f.png)

I recommend creating sidebar topics in their respective categories, closing the topic so there are no replies, and unlisting it (so it doesn't appear in the topic list).

Note that you can not use a topic in a private category as a sidebar in a public category (you can, but users without access to that private topic will just see a blank sidebar!).

## Custom CSS

Each category sidebar is wrapped with a class that contains the category slug, so for the staff category that would be `.category-sidebar-staff`. You can use these classes to style the individual sidebars.

The body tag on pages with sidebars also has a class added so you can use `body.custom-sidebar` to apply styles on all pages that have a sidebar.

---

:heart: Special thanks to [@xrav3nz](https://github.com/xrav3nz) for laying the groundwork to make this component possible!
