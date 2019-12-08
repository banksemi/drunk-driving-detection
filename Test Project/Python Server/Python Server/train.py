
import math
import sys
import warnings
import os
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# Delete warning message
if not sys.warnoptions:
    warnings.simplefilter("ignore")
    os.environ["PYTHONWARNINGS"] = "ignore"

columns = ['timestamp', 'heartRate', 'gyroscopeX', 'gyroscopeY', 'gyroscopeZ', 'gyroscopeRotationX', 'gyroscopeRotationY', 'gyroscopeRotationZ', 'light']

data = {}
data["drink"] = []
data["workout"] = []
data["nothing"] = []

def DFPreprocessing(data):
    global columns
    # ' timestamp'처럼 공백이 들어간 컬럼 이름 수정
    data.columns = columns
    # 시간 데이터를 분 단위로 변경
    if len(data) > 0:
        data["time"] = (data["timestamp"] - data.loc[0, "timestamp"]) / 1000 / 60
    else:
        data["time"] = 0
    return data

def read(htype, name):
    temp = pd.read_csv(name)
    DFPreprocessing(temp)
    
    max_time = temp["time"].max()
    data[htype].append({'name':name, 'data': create_clip(temp, 0, max_time)})


    for i in range(0,1000,10):
        if (i > max_time - 15):
            break;
        for j in range(15,121,15):
            try:
                print("{} ({}~{})".format(name,i , i+j))
                data[htype].append({'name':"{} ({}~{})".format(name,i , i+j), 'data': create_clip(temp, i, i + j)})
            except:
                print("에러")
            if (i + j > max_time):
                break;



def create_clip(temp, addtime1, addtime2, limit=120):
    temp = temp.loc[temp["time"] >= addtime1]
    temp = temp.loc[temp["time"] <= addtime2]
    temp = pd.DataFrame(np.array(temp), columns=temp.columns)
    temp["time"] = temp["time"] - temp.loc[0,"time"]
    temp = temp.loc[temp["time"] < limit]

    if (len(temp) < 60 * 10):
        raise Exception
    
    return temp


def search(dirname, files):
    try:
        filenames = os.listdir(dirname)
        for filename in filenames:
            full_filename = os.path.join(dirname, filename)
            if os.path.isdir(full_filename):
                search(full_filename, files)
            else:
                ext = os.path.splitext(full_filename)[-1]
                if ext == '.csv':
                    files.append(full_filename)
    except PermissionError:
        pass

def data_load():
    paths = []
    search("../../../Data", paths)

    for path in paths:
        if (path.find("drink") != -1):
            read("drink", path)
        elif (path.find("exercise") != -1 or path.find("work out") != -1):
            read("workout", path)
        else:
            read("nothing", path)


import numpy as np
from sklearn.linear_model import Ridge
from sklearn.neighbors import LocalOutlierFactor
from sklearn.cluster import DBSCAN
def Preprocessing(X):
    X = np.array(X)
    return np.column_stack([X])
    
def HeartRate(data, graph=False):
    temp = data.copy()
    
    
    # Remove duplicated data in hreat rate or null data
    index_list = []
    last = 0
    for index, row in temp.iterrows():
        if (row["heartRate"] > 0 and last <= 0):
            index_list.append(index)
            
        last = row["heartRate"]

    temp = temp.loc[index_list]

    
    # Find Linear Curve
    X = np.array(temp["time"]).reshape(-1, 1)
    Y = np.array(temp["heartRate"]).reshape(-1, 1)
    
    rid = Ridge(alpha=90)
    rid.fit(Preprocessing(X), Y)
    if (graph):
        plt.scatter(temp["time"], temp["heartRate"], c='red')

    new_X_range = np.arange(0, temp["time"].max(), dtype=np.float64)
    new_X = Preprocessing(new_X_range.reshape(-1,1))
    if (graph):
        plt.plot(new_X_range, rid.predict(new_X),c='gray')
    

    # Find Outlier data
    cluster = DBSCAN(eps=23, min_samples=8).fit_predict(np.column_stack([X,Y]))
    
    # Remove Outlier data
    temp = temp.loc[cluster != -1]
    
    # Fine Linear Curve without outlier data
    X = np.array(temp["time"]).reshape(-1, 1)
    Y = np.array(temp["heartRate"]).reshape(-1, 1)
    if len(temp) > 0:
        rid = Ridge(alpha=90)
        rid.fit(Preprocessing(X), Y)
        return [rid, temp]
    else:
        return [None, temp]

def GetStat(column):
    return [column.mean(), column.std()]

def GetFeature(label, item):
    model = HeartRate(item)[0]
    if (model == None):
        return None;
    heartrate = model.predict(np.array([0, 120]).reshape(-1,1)).reshape(-1)
    light = GetStat(item["light"])
    
    gyroscope = item["gyroscopeX"] * item["gyroscopeX"]+item["gyroscopeY"] * item["gyroscopeY"]+ item["gyroscopeZ"] * item["gyroscopeZ"]
    gyroscope = gyroscope.pow(1./2)
    gyroscope = GetStat(gyroscope)
    gyroscopeX = GetStat(item['gyroscopeRotationX'])
    gyroscopeY = GetStat(item['gyroscopeRotationY'])
    gyroscopeZ = GetStat(item['gyroscopeRotationZ'])
    if label != None:
        row = np.hstack([label, heartrate, light, gyroscope, gyroscopeX,gyroscopeY,gyroscopeZ])
    else:
        row = np.hstack([heartrate, light, gyroscope, gyroscopeX,gyroscopeY,gyroscopeZ])
    return row

from sklearn.preprocessing import MinMaxScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score
min_max_scaler = None
model = None
def train():
    global min_max_scaler, model
    data_load()
    if not os.path.isdir("Cache"):
        os.makedirs("Cache")
    temp = []
    for label in data:
        for item in data[label]:
            print("processing:", item["name"])
            cache_name = item["name"]
            t = cache_name.split("\\")
            cache_name = "Cache/" + t[len(t) - 1]
            if not os.path.isfile(cache_name + '.npy'):
                np.save(cache_name, GetFeature(label, item['data']))

            loaded_data = np.load(cache_name + '.npy',allow_pickle=True)
            if (len(loaded_data.shape) != 0):
                temp.append(list(loaded_data))

    df = pd.DataFrame(temp, columns=['class', 'heartrate', 'heartrate2', 'light_mean', 'light_std'
                                    , 'gyroscope_mean', 'gyroscope_std', 'gyroscopeX_mean', 'gyroscopeX_std'
                                    , 'gyroscopeY_mean', 'gyroscopeY_std', 'gyroscopeZ_mean', 'gyroscopeZ_std'])
    df = df.sample(frac=1).reset_index(drop=True)
    X = df.loc[:, df.columns != 'class']
    Y = df.loc[:, 'class']
    min_max_scaler = MinMaxScaler()
    X_min_max_scaled = min_max_scaler.fit_transform(X)
    X_min_max_scaled = pd.DataFrame(X_min_max_scaled, columns=[X.columns])

    model = DecisionTreeClassifier(max_depth=7)
    model.fit(X_min_max_scaled, Y)
    cv_scores = cross_val_score(model, X_min_max_scaled, Y, cv=5)
    print(Y.value_counts())
    print("Model Score:", cv_scores.mean())

def predict(data):
    global min_max_scaler, model
    X = GetFeature(None, data);
    if (X is None):
        return "Need more data"
    X_min_max_scaled = min_max_scaler.transform([X])
    return model.predict(X_min_max_scaled)[0]
