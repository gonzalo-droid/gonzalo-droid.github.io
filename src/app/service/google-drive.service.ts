import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  constructor(private http: HttpClient) {}

  downloadPdf(pdfLink: string): Observable<Blob> {
    return this.http.get(pdfLink, { responseType: 'blob' });
  }
}
