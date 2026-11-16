import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  conEslogan = input(false); // muestra "QUESTION EVERYTHING" debajo
}