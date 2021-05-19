const editorialRouter = {
  path: "/editorial",
  component: () => import("../../views/editor/EditorLayout.vue"),
  redirect: "/editorial/overview",
  hidden: true,
  meta: {
    title: "Editor",
    roles: ["admin", "editor"]
  },
  children: [
    {
      path: "overview",
      component: () => import("../../views/editor/Overview.vue"),
      meta: {
        title: "Redaktion",
        roles: ["admin", "editor"],
        icon: "create"
      }
    },
    {
      path: "article/:id",
      component: () => import("../../views/editor/CrudArticleView.vue"),
      hidden: true,
      props: true,
      meta: {
        title: "Edit",
        roles: ["admin", "editor"]
      }
    }
  ]
};

export default editorialRouter;
