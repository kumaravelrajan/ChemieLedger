<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      Benutzerliste
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Suche"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :search="search"
      :items="users"
      :loading="loading"
      :loading-text="loadingText"
      :footer-props="footerOptions"
    >
      <template v-slot:top>
        <v-dialog v-model="dialog" max-width="500px">
          <v-form @submit.prevent="save" v-model="editFormValid" ref="form">
            <v-card>
              <v-card-title>
                <span class="headline">Benutzer Editieren</span>
              </v-card-title>

              <v-card-text>
                <v-container fluid grid-list-md>
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="editUser.name"
                        label="Name"
                        :rules="validationRules.fieldRequired"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex md6>
                      <v-text-field
                        v-model="editUser.surname"
                        label="Nachname"
                        :rules="validationRules.fieldRequired"
                        required
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="editUser.email"
                        label="E-Mail"
                        :rules="validationRules.fieldEmail"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex md6>
                      <span class="subheading">Rolle</span>
                      <v-chip-group
                        column
                        v-model="editUserRoles"
                        multiple
                        active-class="primary--text"
                      >
                        <v-chip v-for="role in availableRoles" :key="role">{{
                          role
                        }}</v-chip>
                      </v-chip-group>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close"
                  >Schliessen</v-btn
                >
                <v-btn color="blue darken-1" text type="submit"
                  >Speichern</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </template>

      <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon small @click="deleteItem(item)">delete</v-icon>
      </template>

      <template v-slot:item.roles="{ item }">
        <v-chip-group>
          <v-chip v-for="role in item.roles" :key="role">{{ role }}</v-chip>
        </v-chip-group>
      </template>

      <template v-slot:item.createdAt="{ item }">{{
        item.createdAt | formatDateTime
      }}</template>
    </v-data-table>
  </v-card>
</template>
<script>
import { getAllUsers, patchUser, deleteUser } from "./_api";
import {
  fieldRequired,
  fieldEmail,
  fieldPassword
} from "@/util/form-validation";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";

export default {
  name: "UserCrud",
  data() {
    return {
      footerOptions: {
        itemsPerPageText: "Einträge pro Seite",
        itemsPerPageAllText: "Alle"
      },
      search: "",
      availableRoles: ["regular", "editor", "admin"],
      dialog: false,
      loading: true,
      loadingText: "Einträge werden geladen...",
      headers: [
        {
          text: "Name",
          align: "left",
          value: "name"
        },
        {
          text: "Nachname",
          value: "surname"
        },
        {
          text: "E-Mail",
          value: "email"
        },
        {
          text: "Registrierungsdatum",
          value: "createdAt"
        },
        {
          text: "Rollen",
          value: "roles"
        },
        { text: "", value: "action", sortable: false }
      ],
      users: [],
      editUserIndex: -1,
      editUserRoles: [],
      editUser: {},
      editFormValid: false,
      validationRules: {
        fieldRequired: fieldRequired,
        fieldEmail: fieldEmail,
        fieldPassword: fieldPassword
      }
    };
  },
  mounted() {
    getAllUsers()
      .then(res => {
        if (res.data.users) {
          this.users = res.data.users;
        }
      })
      .catch(() => {
        this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
          type: "error",
          msg: "Es ist ein Fehler beim Laden der Benutzer aufgetreten."
        });
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    editItem(item) {
      this.editUserIndex = this.users.indexOf(item);
      this.editUser = Object.assign({}, item);

      this.editUserRoles.splice(0, this.editUserRoles.length);
      if (this.editUser.roles) {
        this.editUser.roles.forEach(role => {
          this.editUserRoles.push(this.availableRoles.indexOf(role));
        });
      }
      this.dialog = true;
    },
    close() {
      this.editUserIndex = -1;
      this.editUser = Object.assign({});
      this.editUserRoles.splice(0, this.editUserRoles.length);
      this.dialog = false;
    },
    save() {
      if (this.editUserIndex > -1) {
        if (this.$refs.form.validate()) {
          if (this.editUser.roles || this.editUserRoles.length > 0) {
            this.editUser.roles.splice(0, this.editUser.roles.length);
            this.editUserRoles.forEach(roleId => {
              this.editUser.roles.push(this.availableRoles[roleId]);
            });
          }

          patchUser(this.editUser._id, {
            name: this.editUser.name,
            surname: this.editUser.surname,
            email: this.editUser.email,
            roles: this.editUser.roles
          })
            .then(res => {
              if (res.data.user) {
                Object.assign(this.users[this.editUserIndex], this.editUser);
              } else {
                this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "error",
                  msg:
                    "Es ist ein Fehler beim speichern des Benutzers aufgetreten."
                });
              }
              this.close();
            })
            .catch(() => {
              this.close();
            });
        }
      }
    },
    deleteItem(item) {
      const index = this.users.indexOf(item);
      var confAnswer = window.confirm(
        "Möchten Sie den Benutzer wirklich löschen?"
      );
      if (confAnswer) {
        deleteUser(item._id)
          .then(res => {
            if (res.data.success) {
              this.users.splice(index, 1);
            } else {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "error",
                msg: "Es ist ein Fehler beim löschen des Benutzers aufgetreten."
              });
            }
          })
          .catch(() => {
            //should not happen
          });
      }
    }
  }
};
</script>
