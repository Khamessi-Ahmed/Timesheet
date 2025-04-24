import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { EmpLayoutComponent } from './employee/emp-layout/emp-layout.component';
import { ManLayoutComponent } from './manager/man-layout/man-layout.component';
import { TacheComponent } from './employee/tache/tache.component';
import { ManProjectComponent } from './manager/man-project/man-project.component';


export const routes: Routes = [

    {
        path:'',
        pathMatch:'full',
        component:LoginComponent
    },
    {
        path:'adminLayout',
        component:LayoutComponent,
    },
    {
        path:'dashboard',
        component:DashboardComponent
    },{
        path:'employee',
        component:EmpLayoutComponent
    },
    {
        path:'manager',
        component:ManLayoutComponent
    },
    {
        path: 'EmpeloyeeTache',
        component: TacheComponent,
      },
      {
        path:'managerTache',
        component:ManProjectComponent
      }
];
