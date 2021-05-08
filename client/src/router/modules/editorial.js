const editorialRouter = {
  path: "/editorial",
  component: () => import("@/views/editor/EditorLayout"),
  redirect: "/editorial/overview",
  hidden: true,
  meta: {
    title: "Editor",
    roles: ["admin", "editor"]
  },
  children: [
    {
      path: "overview",
      component: () => import("@/views/editor/Overview"),
      meta: {
        title: "Redaktion",
        roles: ["admin", "editor"],
        icon: "create"
      }
    },
    {
      path: "article/:id",
      component: () => import("@/views/editor/CrudArticleView"),
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
