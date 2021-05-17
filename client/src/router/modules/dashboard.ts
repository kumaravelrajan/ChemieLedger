const editorialRouter = {
  path: "/dashboard",
  component: () => import("../../views/dashboard/DashboardLayout.vue"),
  redirect: "/dashboard/profile",
  meta: {
    title: "Meine Aktivitäten",
    icon: "home",
    roles: ["regular", "editor", "admin"]
  },
  children: [
    {
      path: "communication",
      component: () => import("../../views/dashboard/CommunicationView.vue"),
      meta: {
        title: "Anfragen",
        icon: "mail",
        roles: ["regular", "editor", "admin"],
        notificationtype: "NEW_COMMUNICATION"
      }
    },
    {
      path: "requests",
      component: () => import("../../views/dashboard/OwnRequestsView.vue"),
      meta: {
        title: "Gesuche/Angebote",
        icon: "ballot",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "whatchlist",
      component: () => import("../../views/dashboard/WhatchlistView.vue"),
      meta: {
        title: "Merkliste",
        icon: "favorite",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "draft",
      component: () => import("../../views/dashboard/OwnRequestsDraftView.vue"),
      meta: {
        title: "Entwürfe",
        icon: "drafts",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "archive",
      component: () => import("../../views/dashboard/OwnRequestsArchiveView.vue"),
      meta: {
        title: "Archiv",
        icon: "archive",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "profile",
      component: () => import("../../views/dashboard/Profile.vue"),
      meta: {
        title: "Profil",
        icon: "account_circle",
        roles: ["regular", "editor", "admin"]
      }
    }
  ]
};

export default editorialRouter;
