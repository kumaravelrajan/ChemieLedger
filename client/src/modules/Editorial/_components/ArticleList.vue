<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      {{ generalHeadline }}
      <v-spacer></v-spacer>
      <v-text-field
        v-model="table.search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="table.headers"
      :search="table.search"
      :items="table.articles"
      :loading="table.loading"
      :loading-text="table.loadingText"
      no-data-text="Keine Artikel vorhanden..."
      no-results-text="Keine Artikel für diese Suchkriterien..."
      :footer-props="footerOptions"
    >
      <template v-slot:top>
        <v-dialog v-model="dialog" max-width="600px">
          <v-form @submit.prevent="save" v-model="formValid" ref="form">
            <v-card>
              <v-card-title>
                <span class="headline">Artikel editieren/anlegen...</span>
              </v-card-title>
              <v-card-text>
                <v-container fluid>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="editedItem.article.headline"
                        label="Überschrift"
                        :rules="validationRules.fieldRequired"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="editedItem.article.authorName"
                        label="Autor"
                        :rules="validationRules.fieldRequired"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        type="Number"
                        v-model="editedItem.article.readingTime"
                        label="Lesezeit"
                        suffix="Minuten"
                        :rules="validationRules.numberGreaterZero"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col></v-col>
                  </v-row>
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

      <template v-slot:item.createdAt="{ item }">{{
        item.createdAt | formatDateTime
      }}</template>
      <template v-slot:item.isPublic="{ item }">
        <v-checkbox :disabled="true" v-model="item.isPublic"></v-checkbox>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon small @click="deleteItem(item)">delete</v-icon>
      </template>
    </v-data-table>
    <v-container>
      <v-row justify="center">
        <v-btn color="primary" class="mb-2" @click="open">Neuer Artikel</v-btn>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
import { getArticleOverviewList, deleteArticle, postNewArticle } from "../_api";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import { fieldRequired, numberGreaterZero } from "@/util/form-validation";

export default {
  name: "ArticleList",
  props: {
    articleType: {
      validator: function(val) {
        return ["example", "news"].indexOf(val) !== -1;
      }
    },
    generalHeadline: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      footerOptions: {
        itemsPerPageText: "Einträge pro Seite",
        itemsPerPageAllText: "Alle"
      },
      table: {
        search: "",
        headers: [
          {
            text: "Überschrift",
            align: "left",
            value: "headline"
          },
          {
            text: "Autor",
            value: "authorName"
          },
          {
            text: "Lesezeit",
            value: "readingTime"
          },
          {
            text: "Erstelldatum",
            value: "createdAt"
          },
          {
            text: "Freigeben",
            value: "isPublic"
          },
          { text: "", value: "action", sortable: false }
        ],
        articles: [],
        loading: true,
        loadingText: "Artikel werden geladen..."
      },
      editedItem: {
        index: -1,
        article: {
          headline: "",
          authorName: "",
          readingTime: 0,
          createdAt: "",
          isPublic: false
        }
      },
      formValid: false,
      defaultEditedItem: {
        index: -1,
        article: {
          headline: "",
          authorName: "",
          readingTime: 0,
          createdAt: "",
          isPublic: false
        }
      },
      dialog: false,
      validationRules: {
        fieldRequired: fieldRequired,
        numberGreaterZero: numberGreaterZero
      }
    };
  },
  mounted() {
    getArticleOverviewList(this.articleType)
      .then(res => {
        if (res.data.articles) {
          this.table.articles = res.data.articles;
        }
      })
      .catch(() => {
        this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
          type: "error",
          msg: "Es ist ein Fehler beim Laden der Artikel aufgetreten."
        });
      })
      .finally(() => {
        this.table.loading = false;
      });
  },
  methods: {
    editItem(item) {
      this.$router.push({ path: `/editorial/article/${item._id}` });
    },
    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultEditedItem);
      this.editedItem.article = Object.assign(
        {},
        this.defaultEditedItem.article
      );
      this.$refs.form.resetValidation();
    },
    open() {
      this.editedItem = Object.assign({}, this.defaultEditedItem);
      this.editedItem.article = Object.assign(
        {},
        this.defaultEditedItem.article
      );
      this.dialog = true;
    },
    deleteItem(item) {
      const index = this.table.articles.indexOf(item);
      if (index >= 0) {
        var confAnswer = window.confirm(
          "Möchten Sie den Artikel wirklich löschen?"
        );
        if (confAnswer) {
          deleteArticle(item._id)
            .then(res => {
              if (res.data.success) {
                this.table.articles.splice(index, 1);
              } else {
                this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "error",
                  msg:
                    "Es ist ein Fehler beim löschen des Artikels aufgetreten."
                });
              }
            })
            .catch(() => {
              //should not happen
            });
        }
      }
    },
    save() {
      if (this.$refs.form.validate()) {
        postNewArticle(this.articleType, {
          headline: this.editedItem.article.headline,
          authorName: this.editedItem.article.authorName,
          readingTime: this.editedItem.article.readingTime
        })
          .then(res => {
            if (res.data.article) {
              this.table.articles.push(res.data.article);
            } else {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "error",
                msg: "Es ist ein Fehler beim Anlegen des Artikels aufgetreten."
              });
            }
            this.close();
          })
          .catch(() => {
            this.close();
          });
      }
    }
  }
};
</script>
