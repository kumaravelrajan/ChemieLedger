import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { NgxGraphModule } from '@swimlane/ngx-graph';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NgxGraphOrgTreeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxGraphModule,
    BrowserAnimationsModule,
    CommonModule
  ],
  providers: [],
  exports: [NgxGraphOrgTreeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NgxGraphOrgTreeModule { }
