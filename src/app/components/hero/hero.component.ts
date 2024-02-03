import { Component, OnInit } from '@angular/core';
import { GoogleDriveService } from '../../service/google-drive.service';
@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {

  pdfLink = 'https://docs.google.com/document/d/1e1OHUtA8AZusHwZ0bVsEzs-rTPXZCURADUivfkfr-Uw/edit?usp=drive_link';

  constructor(private googleDriveService: GoogleDriveService) {}


  ngOnInit(): void {
  }

  downloadPdf(): void {
    this.googleDriveService
      .downloadPdf(this.pdfLink)
      .subscribe((blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'cv_gonzalo_lopez_guerrero.pdf';
        link.click();
      });
  }
}
