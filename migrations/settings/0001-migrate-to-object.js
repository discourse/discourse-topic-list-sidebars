export default function migrate(settings, helpers) {
  const oldSetup = settings.get("setup");

  if (oldSetup) {
    const newSidebars = oldSetup.split("|").map((sidebar) => {
      const [categorySlug, topicId] = sidebar.split(",").map((value) => value.trim());
      const sanitizedCategorySlug = categorySlug.replace(/-/g, " ") || "sidebar";      
      const parsedTopicId = parseInt(topicId, 10) || 0;

      let categoryId = helpers.getCategoryIdByName(sanitizedCategorySlug);

      return {
        name: sanitizedCategorySlug.toLowerCase() === "all" ? "all" : sanitizedCategorySlug,
        category: categoryId ? [categoryId] : [],
        tag: [],
        topic_id: parsedTopicId,
      };

    }).filter(item => item !== null);

    settings.set("sidebars", newSidebars);
    settings.delete("setup");
  }

  return settings;
}