import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
    declarations: [HomeComponent, HeaderComponent],
    imports: [AppRoutingModule],
    exports: [HeaderComponent, AppRoutingModule]
})
export class CoreModule {}
