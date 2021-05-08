const adminRouter = {
  path: "/admin",
  component: () => import("@/views/admin/AdminLayout"),
  redirect: "/admin/user",
  meta: {
    title: "Admin",
    roles: ["admin"],
    icon: "security"
  },
  children: [
    {
      path: "user",
      component: () => import("@/views/admin/UserManagement"),
      meta: {
        title: "User Management",
        roles: ["admin"]
      }
    },
    {
      path: "products",
      component: () => import("@/views/admin/ProductVerificationView"),
      meta: {
        title: "Produkt Freigabe",
        roles: ["admin"]
      }
    }
  ]
};

export default adminRouter;
