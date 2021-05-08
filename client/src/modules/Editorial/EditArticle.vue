<template>
  <v-container fluid>
    <v-btn class="mb-4" to="/editorial" color="primary">Zur Übersicht...</v-btn>

    <v-form
      @submit.prevent="saveBasicInformation"
      v-model="formBasicValidation"
      ref="formBasicInformation"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Basisinformationen</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="basicArticleInformation.headline"
                  label="Überschrift"
                  :rules="validationRules.fieldRequired"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="basicArticleInformation.authorName"
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
                  v-model="basicArticleInformation.readingTime"
                  label="Lesezeit"
                  suffix="Minuten"
                  :rules="validationRules.numberGreaterZero"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-chip-group
                  column
                  v-model="basicArticleInformation.articleType"
                  active-class="primary--text"
                  mandatory
                >
                  <v-chip v-for="type in availableArticleTypes" :key="type">{{
                    type
                  }}</v-chip>
                </v-chip-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="text-center justify-center">
                <v-checkbox
                  class="text-center justify-center"
                  v-model="basicArticleInformation.isPublic"
                  label="Freigegeben"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text type="submit">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>

    <v-form
      @submit.prevent="uploadCoverImage"
      enctype="multipart/form-data"
      v-model="formCoverValidation"
      ref="formCoverImage"
    >
      <v-card class="mt-4">
        <v-card-title>
          <span class="headline">Cover-Image</span>
        </v-card-title>
        <v-card-text class="text-center justify-center">
          <v-progress-circular
            v-if="coverImageLoading"
            indeterminate
            color="primary"
          ></v-progress-circular>
          <ImageCarousel
            v-if="articleCoverImageUrl && !coverImageLoading"
            :images="articleCoverImageUrl"
            :hideDelemiters="true"
            :cycle="false"
            :showArrows="false"
          />
        </v-card-text>
        <v-card-actions>
          <v-file-input
            v-model="coverImageUploadFile"
            label="Wähle ein Bild..."
            accept="image/*"
            :rules="validationRules.imageSizeLimitCover"
            show-size
          ></v-file-input>
          <v-btn color="blue darken-1" class="ml-4" text type="submit"
            >Upload</v-btn
          >
          <v-icon class="ml-4" @click="deleteCoverImage()">delete</v-icon>
        </v-card-actions>
      </v-card>
    </v-form>

    <EditParagraph
      v-for="paragraph in orderedParagraphs"
      :key="paragraph._id"
      :initArticleId="articleId"
      :initParagraph="paragraph"
      :deleteParagraphEvent="deleteParagraphEvent"
      class="mt-4"
    ></EditParagraph>

    <v-card class="mt-4">
      <v-card-text class="text-center justify-center">
        <v-btn color="primary" @click="addParagraph()"
          >Paragraph hinzufügen...</v-btn
        >
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import lodash from "lodash";
import {
  fieldRequired,
  numberGreaterZero,
  imageSizeLimitCover
} from "@/util/form-validation";
import {
  getAllArticleInformation,
  patchArticle,
  getImageURL,
  uploadImage,
  addEmptyParagraph,
  deleteParagraph,
  deleteCoverImageFromArticle
} from "./_api";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import ImageCarousel from "@/components/ImageCarousel";
import EditParagraph from "./_components/EditParagraph";

export default {
  name: "EditArticle",
  components: {
    ImageCarousel,
    EditParagraph
  },
  props: ["articleId"],
  data() {
    return {
      basicArticleInformation: {
        headline: "",
        authorName: "",
        readingTime: 0,
        isPublic: false,
        articleType: ""
      },
      formBasicValidation: false,

      coverImageUploadFile: null,
      coverImageLoading: false,
      articleCoverImageUrl: null,
      formCoverValidation: false,

      paragraphs: [],
      defaultParagraph: {
        _id: "",
        headline: "",
        text: "",
        order: 0,
        imagePath: ""
      },

      availableArticleTypes: {
        news: "Neuigkeit",
        example: "Anwendungsbeispiel"
      },
      validationRules: {
        fieldRequired: fieldRequired,
        numberGreaterZero: numberGreaterZero,
        imageSizeLimitCover: imageSizeLimitCover
      }
    };
  },
  computed: {
    orderedParagraphs: function() {
      return lodash.orderBy(this.paragraphs, "order");
    }
  },
  mounted() {
    getAllArticleInformation(this.articleId)
      .then(res => {
        if (res.data.article) {
          const receivedArticle = res.data.article;
          this.setArticleInformation(receivedArticle);
        }
      })
      .catch(() => {
        this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
          type: "error",
          msg: "Es ist ein Fehler beim Laden der Artikel aufgetreten."
        });
      });
  },
  methods: {
    setArticleInformation(receivedArticle) {
      this.basicArticleInformation = Object.assign(
        {},
        this.basicArticleInformation,
        {
          headline: receivedArticle.headline,
          authorName: receivedArticle.authorName,
          readingTime: receivedArticle.readingTime,
          isPublic: receivedArticle.isPublic,
          articleType: Object.keys(this.availableArticleTypes).indexOf(
            receivedArticle.articleType
          )
        }
      );
      this.articleCoverImageUrl = receivedArticle.coverImagePath
        ? [getImageURL(receivedArticle.coverImagePath)]
        : null;
      this.paragraphs = receivedArticle.paragraphs;
    },
    deleteParagraphEvent(paragraphId) {
      deleteParagraph(this.articleId, paragraphId).then(res => {
        if (res.data.article && res.data.article._id) {
          this.setArticleInformation(res.data.article);
        } else {
          this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
            type: "error",
            msg: "Es ist ein Fehler beim Löschen des Paragraphs aufgetreten."
          });
        }
      });
    },
    addParagraph() {
      addEmptyParagraph(this.articleId).then(res => {
        if (res.data.paragraph) {
          const newParagraph = Object.assign(
            {},
            this.defaultParagraph,
            res.data.paragraph
          );
          this.paragraphs.push(newParagraph);
        }
      });
    },
    uploadCoverImage() {
      if (this.$refs.formCoverImage.validate()) {
        this.coverImageLoading = true;
        var formData = new FormData();
        formData.append("file", this.coverImageUploadFile);
        uploadImage(this.articleId, formData)
          .then(res => {
            this.articleCoverImageUrl = [
              getImageURL(res.data.article.coverImagePath)
            ];
          })
          .finally(() => {
            this.coverImageLoading = false;
          });
      }
    },
    deleteCoverImage() {
      this.coverImageLoading = true;
      deleteCoverImageFromArticle(this.articleId)
        .then(res => {
          this.articleCoverImageUrl = [
            getImageURL(res.data.article.coverImagePath)
          ];
        })
        .finally(() => {
          this.coverImageLoading = false;
        });
    },
    saveBasicInformation() {
      if (this.$refs.formBasicInformation.validate()) {
        patchArticle(this.articleId, {
          headline: this.basicArticleInformation.headline,
          authorName: this.basicArticleInformation.authorName,
          readingTime: this.basicArticleInformation.readingTime,
          isPublic: this.basicArticleInformation.isPublic,
          articleType: Object.keys(this.availableArticleTypes)[
            this.basicArticleInformation.articleType
          ]
        })
          .then(res => {
            if (res.data.article) {
              const receivedArticle = res.data.article;
              this.basicArticleInformation = Object.assign(
                {},
                this.basicArticleInformation,
                {
                  headline: receivedArticle.headline,
                  authorName: receivedArticle.authorName,
                  readingTime: receivedArticle.readingTime,
                  isPublic: receivedArticle.isPublic,
                  articleType: Object.keys(this.availableArticleTypes).indexOf(
                    receivedArticle.articleType
                  )
                }
              );
              this.articleCoverImageUrl = receivedArticle.coverImagePath
                ? [getImageURL(receivedArticle.coverImagePath)]
                : null;
            } else {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "error",
                msg:
                  "Es ist ein Fehler beim speichern des Artikels aufgetreten."
              });
            }
          })
          .catch(() => {
            this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
              type: "error",
              msg: "Unerwarteter Fehler."
            });
          });
      }
    }
  }
};
</script>
