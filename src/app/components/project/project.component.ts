import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  public isDoubleClick: Boolean = false;

  constructor() { }

  ngOnInit(): void {

  }

  showZoomIcon(wrapper: HTMLElement): void {
    const zoomIcon = wrapper.querySelector('.zoom-icon') as HTMLElement | null;
    const image = wrapper.querySelector('img') as HTMLImageElement | null;
    if (zoomIcon && image) {
      zoomIcon.style.opacity = '1';
      image.style.opacity = '0.7';
    }
  }

  // Función para ocultar el ícono de lupa al quitar el hover
   hideZoomIcon(wrapper: HTMLElement): void {
    const zoomIcon = wrapper.querySelector('.zoom-icon') as HTMLElement | null;
    const image = wrapper.querySelector('img') as HTMLImageElement | null;
    if (zoomIcon && image) {
      zoomIcon.style.opacity = '0';
      image.style.opacity = '1';
    }
  }

  openLightbox(imageSrc: string): void {
    const lightbox: HTMLElement | null = document.getElementById('lightbox');
    const zoomedImg: HTMLImageElement | null = document.getElementById('zoomedImg') as HTMLImageElement;

    if (lightbox && zoomedImg) {
      zoomedImg.src = imageSrc;
      lightbox.classList.add('active');
    }
  }

  closeLightbox(): void {
    const lightbox: HTMLElement | null = document.getElementById('lightbox');

    if (lightbox) {
      lightbox.classList.remove('active');
    }
  }

  toggleZoom(): void {
    const zoomedImg: HTMLImageElement | null = document.getElementById('zoomedImg') as HTMLImageElement;
    this.isDoubleClick = true;

    if (zoomedImg && !this.isDoubleClick) {
      zoomedImg.style.transform = zoomedImg.style.transform ? '' : 'scale(2)';
    }

    // Reset the double click flag
    this.isDoubleClick = false;
  }


}
