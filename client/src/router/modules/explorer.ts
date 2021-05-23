const explorerRouter = {
  path: "/explorer",
  component: () => import("../../views/explorer/ExplorerLayout.vue"),
  redirect: "/explorer/overview",
  hidden: true,
  meta: {
    title: "Marktplatz",
    roles: ["regular", "editor", "admin"],
    icon: "folder_open"
  },
  children: [
    {
      path: "overview",
      component: () => import("../../views/explorer/Overview.vue"),
      meta: {
        title: "Marktplatz",
        roles: ["regular", "editor", "admin"],
        icon: "folder_open"
      }
    },
    {
      path: "addoffer",
      component: () => import("../../views/explorer/GenerateOffer.vue"),
      hidden: true,
      meta: {
        title: "Angebot erstellen",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "addoffer/:productId",
      component: () => import("../../views/explorer/GenerateOffer.vue"),
      hidden: true,
      props: true,
      meta: {
        title: "Angebot erstellen",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "addrequest",
      component: () => import("../../views/explorer/GenerateRequest.vue"),
      hidden: true,
      meta: {
        title: "Gesuch erstellen",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "addrequest/:productId",
      component: () => import("../../views/explorer/GenerateRequest.vue"),
      hidden: true,
      props: true,
      meta: {
        title: "Gesuch erstellen",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "viewrequest/:requestId",
      component: () => import("../../views/explorer/RequestView.vue"),
      hidden: true,
      props: true,
      meta: {
        title: "Anfrage",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "editrequest/:requestId",
      component: () => import("../../views/explorer/EditRequestView.vue"),
      hidden: true,
      props: true,
      meta: {
        title: "Editieren",
        roles: ["regular", "editor", "admin"]
      }
    }
  ]
};

export default explorerRouter;
