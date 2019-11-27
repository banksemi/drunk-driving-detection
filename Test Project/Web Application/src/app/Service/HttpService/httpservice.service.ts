import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HTTPService {
  private _unique_num = 0;
  private max_queue = 0;
  private _queue = {};

  public progress = 0;

  public end = 0;
  public get queue() {
    return Object.values(this._queue);
  }
  constructor(private http: HttpClient) {
    interval(200).subscribe(res => {
      if (this.end > 0) {
        this.progress = 100;
        this.end--;
      }
      else if (this.end == 0) {
        if (this.max_queue == 0) this.progress = 0;
        else {
          let cnt = (this.max_queue - this.queue.length); // 남은 개수
          let want = ((cnt + 0.9) / this.max_queue) * 100;
          if (this.progress < want) {
            this.progress += 5;
          }
          else {
            this.progress = want;
          }

        }
      }
    });
    console.log('HTTPService');
  }

  private remove_in_queue(num) {
    if (this._queue[num] != undefined) {
      delete (this._queue[num]);
    }
    if (this.queue.length == 0) {
      this.max_queue = 0;
      this.end = 10;
    }
  }

  private HttpRequest(method, url: string, body, message, try_count: number, num?, event?): Subject<any> {
    if (this.getParameters("uuid") != null)
      url = this.addUrlParam(url, "uuid", this.getParameters("uuid"));
    if (event == null)
      event = new Subject();
    if (num == null && message != null) {
      num = this._unique_num++;
      this.max_queue++;
      this._queue[num] = message;
      this.end = 0;
      this.progress = 0;
    }
    try_count--;
    let ht;
    if (method == 'get')
      if (method == 'get')
        ht = this.http.get(url, { withCredentials: true });
      else (method == 'post');
    ht = this.http.post(url, body, { withCredentials: true });

    ht.subscribe
      (
        data => {
          this.remove_in_queue(num);
          event.next(data);
        },
        error => {
          if (try_count > 0)
            this.HttpRequest(method, url, body, message, try_count, num, event);
          else {
            this.remove_in_queue(num);
            event.error(error);
          }
        },
      );
    return event;

  }
  public get(url: string, message?, try_count: number = 3): Subject<any> {
    return this.HttpRequest('get', url, {}, message, try_count);
  }

  public post(url: string, body: FormData, message?, try_count: number = 3): Subject<any> {
    return this.HttpRequest('post', url, body, message, try_count);
  }

  private addUrlParam(url, key, value) {
    var newParam = key+"="+value;
    var result = url.replace(new RegExp("(&|\\?)"+key+"=[^\&|#]*"), '$1' + newParam);
    if (result === url) { 
        result = (url.indexOf("?") != -1 ? url.split("?")[0]+"?"+newParam+"&"+url.split("?")[1] 
           : (url.indexOf("#") != -1 ? url.split("#")[0]+"?"+newParam+"#"+ url.split("#")[1] 
              : url+'?'+newParam));
    }
    return result;
  }
  
  private getParameters(paramName) {
    var returnValue;

    var url = location.href;

    var parameters = (url.slice (url.indexOf ('?') + 1, url.length)). split ('&');

    for (var i = 0; i <parameters.length; i ++) {
        var varName = parameters [i] .split ('=') [0];
        if (varName.toUpperCase () == paramName.toUpperCase ()) {
            returnValue =parameters[i] .split ('=') [1];
            return decodeURIComponent (returnValue);
        }
    }
    return null;
  }
}
