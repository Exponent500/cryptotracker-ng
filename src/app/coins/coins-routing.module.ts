import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoinsComponent } from './coins.component';

const coinsRoutes: Routes = [
    { path: '', component: CoinsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(coinsRoutes)],
    exports: [RouterModule]
})
export class CoinsRoutingModule {}
