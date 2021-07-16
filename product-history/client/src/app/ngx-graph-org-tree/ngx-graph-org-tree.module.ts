import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { NgxGraphModule } from '@swimlane/ngx-graph';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree.component';
import { CommonModule } from '@angular/common';
import { ngxLoadingAnimationTypes, NgxLoadingModule } from 'ngx-loading';

@NgModule({
  declarations: [
    NgxGraphOrgTreeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxGraphModule,
    BrowserAnimationsModule,
    CommonModule,
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.wanderingCubes,
      backdropBackgroundColour: 'rgba(0,0,0,0.1)', 
      backdropBorderRadius: '4px',
      primaryColour: '#ffffff', 
      secondaryColour: '#ffffff', 
      tertiaryColour: '#ffffff'
    })
  ],
  providers: [],
  exports: [NgxGraphOrgTreeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NgxGraphOrgTreeModule { }
