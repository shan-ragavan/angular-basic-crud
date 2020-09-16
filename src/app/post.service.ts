import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

import { Post } from './post.interface';

export interface PostResponseData {
  name: string;
}

@Injectable({ providedIn: 'root' })



export class PostService {
    constructor(private http: HttpClient) {}
    clearForm = new Subject<boolean>();
    emptyF = false;
    domain = 'https://ng-backend-c7d2f.firebaseio.com';
    createUser(username: string, mobile: number, email: string, content: string) {
        console.log('****** connecting via service');
        // Send Http request
        const postData: Post = { username, mobile, email, content  };
        console.log('****** postData with Interface ', postData);
        return this.http
          .post<PostResponseData>(
            this.domain + '/posts.json',
            postData
          );
      }

      updateUser(id: string, username: string, mobile: number, email: string, content: string ) {
        console.log('****** updating via service');
        // Send Http request
        const postData: Post = { id, username, mobile, email, content  };
        console.log('****** Update postData ', postData);
        return this.http
          .patch<PostResponseData>(
            this.domain + '/posts/' + id + '/.json',
            postData
          );
      }

      retrieveUsers() {
        return this.http
        .get(
          this.domain + '/posts.json'
        )
        .pipe(map(responseData => {
          console.log('****** TESTING 123');
          const postsArray: Post[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }
          return postsArray;
        }));
      }

      emptyUser(id?: string) {
        console.log('****** id ', id);
        const deleteUrl = (id !== undefined) ?
        this.domain + '/posts/' + id + '.json' :
        this.domain + '/posts.json';
        return this.http.delete(deleteUrl);
      }
}
