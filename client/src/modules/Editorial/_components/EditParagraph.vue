<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="paragraph.headline" label="Überschrift"></v-text-field>
      <v-spacer></v-spacer>
      <v-select
        v-model="paragraph.imageType"
        :items="imageTypeValues"
        item-text="text"
        item-value="val"
        label="Bildposition"
      ></v-select>

      <v-icon class="ml-4" @click="deleteParagraphEvent(paragraph._id)">delete</v-icon>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col :order="paragraph.imageType=='right'?1:2">
            <v-textarea label="Paragraph text..." v-model="paragraph.text"></v-textarea>
          </v-col>
          <v-col v-if="paragraph.imageType != 'none'" :order="paragraph.imageType=='right'?2:1">
            <v-form
              @submit.prevent="uploadImage"
              enctype="multipart/form-data"
              v-model="formImageValidation"
              ref="formImage"
            >
              <v-card class="elevation-0">
                <v-card-text class="text-center justify-center">
                  <v-progress-circular v-if="imageLoading" indeterminate color="primary"></v-progress-circular>
                  <v-img v-if="imageUrl && !imageLoading" :src="imageUrl" max-width="500" />
                  <v-img v-if="!imageUrl && !imageLoading" :src="placeholderImage" max-width="300" />
                </v-card-text>
                <v-card-actions>
                  <v-file-input
                    v-model="imageUploadFile"
                    label="Wähle ein Bild..."
                    accept="image/*"
                    :rules="validationRules.imageSizeLimit"
                    show-size
                  ></v-file-input>
                  <v-btn color="blue darken-1" class="ml-4" text type="submit">Upload</v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="blue darken-1"
        type="submit"
        text
        @click.prevent="addOrUpdateParagraph"
      >Speichern</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { patchParagraph, uploadParagraphImage, getImageURL } from "../_api";
import { imageSizeLimit } from "@/util/form-validation";

export default {
  name: "EditParagraph",
  props: {
    initArticleId: {
      type: String,
      required: true
    },
    initParagraph: {
      type: Object,
      required: true
    },
    changeOrder: {
      type: Function,
      required: false
    },
    deleteParagraphEvent: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      articleId: this.initArticleId,
      paragraph: this.initParagraph,
      imageTypeValues: [
        { val: "none", text: "Kein Bild" },
        { val: "right", text: "Rechts" },
        { val: "left", text: "Links" }
      ],

      formImageValidation: false,
      imageLoading: false,
      imageUrl: this.initParagraph.imagePath
        ? getImageURL(this.initParagraph.imagePath)
        : null,
      imageUploadFile: null,
      placeholderImage: require("@/assets/images/orionthemes-placeholder-image.png"),
      validationRules: {
        imageSizeLimit: imageSizeLimit
      }
    };
  },
  methods: {
    addOrUpdateParagraph() {
      patchParagraph(this.articleId, this.paragraph._id, {
        headline: this.paragraph.headline,
        text: this.paragraph.text,
        imageType: this.paragraph.imageType
      }).then(res => {
        if (res.data.paragraph) {
          this.paragraph = Object.assign(
            {},
            this.paragraph,
            res.data.paragraph
          );
        }
      });
    },
    uploadImage() {
      if (this.$refs.formImage.validate()) {
        this.imageLoading = true;
        var formData = new FormData();
        formData.append("file", this.imageUploadFile);
        uploadParagraphImage(this.articleId, this.paragraph._id, formData)
          .then(res => {
            if (res.data.paragraph) {
              this.paragraph = Object.assign(
                {},
                this.paragraph,
                res.data.paragraph
              );
              this.imageUrl = this.paragraph.imagePath
                ? getImageURL(this.paragraph.imagePath)
                : null;
            }
          })
          .finally(() => {
            this.imageLoading = false;
          });
      }
    }
  }
};
</script>