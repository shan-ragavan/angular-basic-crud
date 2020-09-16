import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Post } from './post.interface';
import { PostService, PostResponseData } from './post.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loadedPosts: Post[] = [];
  public signupForm: FormGroup;
  editMode = false;
  buttonValue = 'Create';
  loading = false;
  usernameExists = false;
  userId = '';
  constructor(private http: HttpClient, private fb: FormBuilder, private postService: PostService) {}

  ngOnInit(): void {
    // console.log(this.cartObj);
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      content: ['', [Validators.required]]
  });

    this.onFetchPosts();
    this.loading = true;
    this.onValueChanges();

    // We can use Subject when we need anything to update from Service to component
    // this.postService.clearForm.subscribe(resp => {
    //   console.log('****** clearForm Response ', resp);
    //   if (resp) {
    //     this.onClearForm();
    //     this.onFetchPosts();
    //   }
    // });
  }
  get signupFormFn(): any { return this.signupForm.controls; }
  onValueChanges(): void {
    this.signupForm.statusChanges.subscribe(val => {
      console.log('****** changing ' + val);
    });
  }

  onSubmit() {
    console.log('****** this.editMode ', this.editMode);
    if (this.editMode) {
      this.onUpdatePost(this.userId);
    } else {
      this.onCreatePost();
    }
  }

  onCreatePost() {
    this.loading = true;
    const postData = this.signupForm.value;
    console.log('****** trying via service ', postData);
    console.log('****** this.loadedPosts ', this.loadedPosts);
    for (const getUser of this.loadedPosts) {
      if (getUser.username === postData.username) {
        this.usernameExists = true;
        this.loading = false;
        return;
      }
    }
    this.postService
    .createUser(postData.username, postData.mobile, postData.email, postData.content)
    .subscribe(
      responseData => {
        console.log('****** direct Response', responseData);
        this.onClearForm();
        this.onFetchPosts();
      }
    );
  }

  onUpdatePost(userId: string) {
    this.loading = true;
    const postData = this.signupForm.value;
    console.log('****** Updating via service ', postData);
    this.postService
    .updateUser(userId, postData.username, postData.mobile, postData.email, postData.content)
    .subscribe(
      responseData => {
        console.log('****** directttt Response 123', responseData);
        const editedIndex = this.loadedPosts.findIndex(item => item.id === userId );
        this.loadedPosts[editedIndex].username = postData.username;
        this.loadedPosts[editedIndex].mobile = postData.mobile;
        this.loadedPosts[editedIndex].email = postData.email;
        this.loadedPosts[editedIndex].content = postData.content;
        this.loading = false;
        this.onClearForm();
        // this.onFetchPosts();
      }
    );
  }

  onFetchPosts() {
    this.postService
    .retrieveUsers()
    .subscribe(responseData => {
      console.log('****** responseData ', responseData);
      this.loading = false;
      this.loadedPosts = responseData;
    });
  }

  onClearPosts() {
    // Send Http request
    console.log('****** deleting');
    this.postService.emptyUser().subscribe(result => {
      console.log('deleted');
      this.loadedPosts = [];
    });
  }
  onDeletePost(id: string) {
    // Send Http request
    console.log('****** deleting one record');
    this.postService.emptyUser(id).subscribe(result => {
      const deletedIndex = this.loadedPosts.findIndex(item => item.id === id );
      this.loadedPosts.splice(deletedIndex, 1);
    });
  }
  onEditPosts(id: string) {
    this.userId = id;
    console.log('****** ID ', id);
    console.log(this.loadedPosts);
    const userData = this.loadedPosts;
    for (const user of userData) {
      if (user.id === id) {
        this.signupForm.setValue({
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          content: user.content
        });
      }
      this.editMode = true;
      this.buttonValue = 'Update';
    }
  }

  onClearForm() {
    this.signupForm.reset();
    this.editMode = false;
    this.buttonValue = 'Create';
    this.usernameExists = false;
  }
}
