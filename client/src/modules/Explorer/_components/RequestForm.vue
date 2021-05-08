<template>
  <v-container>
    <v-dialog v-model="addProductDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Produkt hinzufügen</span>
          </v-card-title>
          <v-card-text>
            Um ein neues Produkt hinzuzufügen müssen Sie unter "Produkte" auf "Produkt hinzufügen..."
            klicken. Dort können Sie ein neues Produkt vorschlagen, das dann noch von einem Administrator 
            freigegeben werden muss.
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="close">Schliessen</v-btn>
            <v-btn color="blue darken-1" text @click="$router.push({ path: '/product/productoverview/'})">Zu Produkte wechseln</v-btn>
          </v-card-actions>
        </v-card>
    </v-dialog>
    <v-row v-if="loading">
      <v-col align="center" justify="center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-form
      @submit.prevent="addRequest"
      v-model="requestFormValid"
      ref="submitForm"
      id="submitForm"
      v-if="!loading"
    >
      <v-row>
        <v-col>
          <v-text-field
            v-model="request.title"
            label="Titel"
            :rules="validationRules.fieldRequired"
            required
            :readonly="!request.isDraft && request.isClosed"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="11">
          <v-select
            v-model="request.product"
            :items="availableProducts"
            :item-text="getItemText"
            return-object
            label="Produkt"
            :rules="validationRules.fieldRequired"
            required
            :readonly="!request.isDraft && request.isClosed"
          >
            <template v-slot:item="data">{{
              data.item.unit.symbol
                ? data.item.title.description + "/" + data.item.unit.symbol
                : data.item.title.description + "/" + data.item.unit.description
            }}</template>
          </v-select>
        </v-col>
        <v-col cols="1">
          <v-btn color="primary" @click="openAddProductDialog()">
            <v-icon>add</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="request.amount"
            label="Menge"
            type="number"
            step=".1"
            :suffix="
              request.product &&
              request.product.unit &&
              request.product.unit.symbol
                ? request.product.unit.symbol
                : ''
            "
            :rules="validationRules.requiredNumberGreaterZero"
            required
            :readonly="!request.isDraft && request.isClosed"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="request.price"
            label="Preis"
            type="number"
            step=".01"
            suffix="€"
            :rules="validationRules.requiredNumberGreaterZero"
            required
            :readonly="request.isClosed"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="request.plz"
            :label="request.isOffer ? 'Verfügbar in...' : 'Gesucht in...'"
            :rules="validationRules.fieldPLZ"
            :maxlength="5"
            placeholder="PLZ"
            required
            :readonly="request.isClosed"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="request.availableTo"
            type="date"
            :label="request.isOffer ? 'Verfügbar zum...' : 'Gesucht zum...'"
            prepend-icon="event"
            :readonly="request.isClosed"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-select
            v-model="request.origin"
            :items="availableParentOrigins"
            item-text="description"
            item-value="_id"
            label="Herkunft"
            :rules="validationRules.fieldRequired"
            required
            @change="getSubOrigins"
            :readonly="request.isClosed"
          ></v-select>
        </v-col>
        <v-col>
          <v-select
            :disabled="availableSubOrigins.length < 1"
            v-model="request.subOrigin"
            :items="availableSubOrigins"
            item-text="description"
            item-value="_id"
            label="Genauere Herkunft"
            :readonly="request.isClosed"
          ></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-text-field
            v-model="request.usage"
            label="Verwendungszweck"
            :readonly="request.isClosed"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="request.features"
            label="Merkmale"
            :readonly="request.isClosed"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-textarea
            v-model="request.description"
            label="Beschreibung"
            :readonly="request.isClosed"
          ></v-textarea>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-checkbox
            v-model="request.negotiation"
            label="Verhandlungsbasis"
            :readonly="request.isClosed"
          ></v-checkbox>
        </v-col>
        <v-col>
          <v-checkbox
            v-model="request.delivery"
            :label="
              request.isOffer ? 'Lieferung möglich' : 'Lieferung erwünscht'
            "
            :readonly="request.isClosed"
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-form>

    <v-container v-if="request.isOffer" class="elevation-2">
      <v-row>
        <v-col>
          <div>Fotos</div>
          <v-slide-group
            v-if="request.imgPaths.length > 0"
            justify="center"
            class="mb-2 mt-10"
            show-arrows
          >
            <v-slide-item
              v-for="src in request.imgPaths"
              :key="src"
              class="mr-1"
            >
              <v-img
                :src="receiveImagePath(src)"
                max-height="200px"
                max-width="200px"
              >
                <v-btn
                  color="primary"
                  @click="deleteImage(src)"
                  v-if="!request.isClosed"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-img>
            </v-slide-item>
          </v-slide-group>
        </v-col>
      </v-row>
      <v-form
        @submit.prevent="uploadImage"
        enctype="multipart/form-data"
        v-model="formImageValid"
        ref="formImage"
        id="uploadImageForm"
        v-if="!request.isClosed"
      >
        <v-row>
          <v-col>
            <v-file-input
              v-model="imageUploadFile"
              label="Wähle ein Bild..."
              accept="image/*"
              :rules="validationRules.imageSizeLimit"
              show-size
            ></v-file-input>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="right" justify="right">
            <v-btn type="submit" color="primary">Foto Upload</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>

    <v-row>
      <v-col align="right" justify="right">
        <v-btn
          color="secondary"
          v-if="!request.isDraft"
          @click="$router.go(-1)"
          class="mr-2"
          >Zurück</v-btn
        >
        <v-btn
          v-if="request.isDraft && !request.isClosed"
          color="secondary"
          @click="deleteAndBack"
          class="mr-2"
          >Abbrechen</v-btn
        >
        <v-btn
          v-if="!request.isClosed"
          type="submit"
          color="primary"
          form="submitForm"
          >Verbindlich einstellen</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import moment from "moment";
import { getProductInformation } from "@/modules/Products/_api";
import {
  fieldRequired,
  imageSizeLimit,
  requiredNumberGreaterZero,
  fieldPLZ,
} from "@/util/form-validation";
import {
  getRequest,
  deleteRequest,
  pushRequest,
  getImageURL,
  uploadRequestImage,
  deleteImageFromRequest,
  getParentOrigins,
  getAvailableSubOrigins,
} from "../_api";

export default {
  name: "RequestForm",
  props: {
    requestId: {
      type: String,
      requestId: true,
    },
  },
  data() {
    return {
      addProductDialog: false,
      addProductData: {
        productTitle: "",
        productUnit: "",
        productUnitSymbol: "",
      },
      loading: true,
      requestFormValid: false,
      formImageValid: false,
      imageUploadFile: null,
      imgPaths: [],
      availableProducts: [],
      availableUnits: [],
      availableProductTitles: [],
      chooseProductUnit: null,
      availableParentOrigins: [],
      availableSubOrigins: [],
      request: {
        title: "",
        plz: "",
        amount: 0,
        availableTo: moment(new Date()).format("YYYY-MM-DD"),
        usage: "",
        features: "",
        description: "",
        price: 0,
        negotiation: false,
        delivery: false,
        product: {
          unit: null,
          title: null,
        },
        isOffer: null,
        imgPaths: [],
        origin: null,
        subOrigin: null,
        isDraft: true,
      },
      validationRules: {
        fieldRequired: fieldRequired,
        imageSizeLimit: imageSizeLimit,
        requiredNumberGreaterZero: requiredNumberGreaterZero,
        fieldPLZ: fieldPLZ,
      },
    };
  },
  async mounted() {
    await getRequest(this.requestId).then((res) => {
      if (res.data.request) {
        this.request = Object.assign({}, this.request, res.data.request, {
          availableTo: moment(new Date()).format("YYYY-MM-DD"),
        });
      }
    });

    await this.initProducts();

    await getParentOrigins().then((res) => {
      if (res.data.origins) {
        this.availableParentOrigins = res.data.origins;
      }
    });

    this.loading = false;
  },
  methods: {
    async initProducts() {
      await getProductInformation()
        .then((res) => {
          if (res.data.products) {
            this.availableProducts = res.data.products;
          }
          if (res.data.units) {
            this.availableUnits = res.data.units;
          }
          if (res.data.productTitles) {
            this.availableProductTitles = res.data.productTitles;
          }
        })
        .catch(() => {
          //SHOULD NOT HAPPEN
        });
    },
    unitSelected() {
      this.addProductData = Object.assign({}, this.addProductData, {
        productUnit: this.chooseProductUnit.description,
        productUnitSymbol: this.chooseProductUnit.symbol,
      });
    },
    close() {
      this.addProductDialog = false;
    },
    openAddProductDialog() {
      this.addProductDialog = true;
    },
    getSubOrigins(item) {
      getAvailableSubOrigins(item).then((res) => {
        if (res.data.origins) {
          this.availableSubOrigins = res.data.origins;
        }
      });
    },
    deleteImage(src) {
      deleteImageFromRequest(this.request._id, { path: src }).then((res) => {
        if (res.data.imgPaths) {
          this.request = Object.assign({}, this.request, {
            imgPaths: res.data.imgPaths,
          });
        }
      });
    },
    receiveImagePath(path) {
      return getImageURL(path);
    },
    getItemText(item) {
      if (item.title && item.unit) {
        if (item.unit.symbol) {
          return item.title.description + "/" + item.unit.symbol;
        }
        return item.title.description + "/" + item.unit.description;
      }
      return "";
    },
    deleteAndBack() {
      deleteRequest(this.request._id).then((res) => {
        if (res.data.success) {
          this.$router.go(-1);
        }
      });
    },
    uploadImage() {
      if (this.$refs.formImage.validate()) {
        var formData = new FormData();
        formData.append("file", this.imageUploadFile);
        uploadRequestImage(this.request._id, formData).then((res) => {
          if (res.data.imgPaths) {
            this.request = Object.assign({}, this.request, {
              imgPaths: res.data.imgPaths,
            });
          }
        });
      }
    },
    addRequest() {
      if (this.$refs.formImage) {
        this.$refs.formImage.resetValidation();
      }
      if (this.$refs.submitForm.validate()) {
        const pushRequestData = Object.assign(
          {},
          this.request,
          { product: this.request.product._id },
          { availableTo: new Date(this.request.availableTo) },
          { isDraft: false }
        );
        pushRequest(this.request._id, pushRequestData).then((res) => {
          if (res.data.success) {
            this.$router.go(-1);
          }
        });
      }
    },
  },
};
</script>
