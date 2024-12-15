import { NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {FunnelsComponent} from "./funnels/funnels.component";

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        CommonModule,
        AppComponent,
        FunnelsComponent,
    ],
    providers: [],
})

export class AppModule {}
