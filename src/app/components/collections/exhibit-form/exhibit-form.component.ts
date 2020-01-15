import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Exhibit} from '../../../model/implementations/exhibit.model';
import {CHOType} from '../../../model/interfaces/objects/cho-type.interface';
import {VremApiService} from '../../../services/http/vrem-api.service';
import {Vector3f} from '../../../model/interfaces/general/vector-3f.model';
import {ExhibitUpload} from '../../../model/implementations/exhibit-upload.model';
import {Observable, of} from 'rxjs';
import {catchError, first, map, tap} from 'rxjs/operators';
import {Exhibition} from '../../../model/implementations/exhibition.model';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-exhibit-form',
  templateUrl: './exhibit-form.component.html',
  styleUrls: ['./exhibit-form.component.scss']
})
export class ExhibitFormComponent implements OnInit {

  exhibitForm: FormGroup;
  filename: string;
  type_image = false;
  type_model = false;
  ratio: number;

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef,
              private _vrem_service: VremApiService, private _snackbar: MatSnackBar ) { }

  ngOnInit() {
    this.exhibitForm = this.fb.group({
      artCollection: ['classics'],
      name: [''],
      description: [''],
      type: ['IMAGE'],
      exhibitFile: [null],
      exhibitFileExtension: [''],
      size_width: [''],
      size_height: [''],
      light: [true]
    });

  }

  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      console.log(event.target.files);
      this.filename = event.target.files[0].name.substring(0, event.target.files[0].name.length - 4);

      if (event.target.files[0].type.startWith('image/')) {
        this.type_image = true;
      } //TODO check type for model


      reader.readAsDataURL(file);

      reader.onload = () => {
        let img = new Image();
        img.onload = () => {
          this.ratio = img.width / img.height;
          console.log(this.ratio);
        };
        img.src = <string>reader.result;

        const re = /(?:\.([^.]+))?$/;
        const extension = re.exec(file.name)[1];
        this.exhibitForm.patchValue({
          exhibitFile: reader.result,
          exhibitFileExtension: extension
        });



        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  setHeight(width: number) {
    this.exhibitForm.controls['size_height'].setValue(width / this.ratio);
  }
  setWidth(height: number) {
    this.exhibitForm.controls['size_width'].setValue(height * this.ratio);
  }

  onSubmit() {

    let position: Vector3f;
    position = {x: 0, y: 0, z: 0};
    let size: Vector3f;
    size = {x: this.exhibitForm.get('size_width').value, y: this.exhibitForm.get('size_height').value, z: 0};


    const exhibit = new Exhibit(
      '',
      /*this.exhibitForm.get('name').value*/ this.filename,
      <CHOType>this.exhibitForm.get('type').value,
      this.exhibitForm.get('description').value,
      '',
      this.exhibitForm.get('light').value,
      '',
      position,
      size
      );

    const exhibitUpload = new ExhibitUpload(
      this.exhibitForm.get('artCollection').value,
      exhibit,
      this.exhibitForm.get('exhibitFile').value,
      this.exhibitForm.get('exhibitFileExtension').value
    );

    this._vrem_service.uploadExhibit(exhibitUpload).pipe(first(), map(e => true), catchError(() => of(false))).subscribe(s => console.log(s));

    this._snackbar.open(`Exhibit '${this.filename}' saved successfully!`, null, <MatSnackBarConfig>{duration : 2500});
  }

}
