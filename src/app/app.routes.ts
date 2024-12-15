import { Routes } from '@angular/router';
import { FunnelsComponent } from "./funnels/funnels.component";

export const routes: Routes = [
    { path: '', component: FunnelsComponent },
    { path: '**', redirectTo: '' }
];
