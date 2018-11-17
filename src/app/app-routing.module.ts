import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './core/home/home.component';
import { CoinsComponent } from './coins/coins.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'coins', component: CoinsComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
