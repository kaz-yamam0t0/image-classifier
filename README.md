# Image Classifier

![Image Classifier](./capture.png)

## Overview

Image Classifier is a simple local web application for efficiently classifying and resizing image files. It contains a standalone web server written in python and runs in local environments.

- Classify images efficiantly just by pressing ENTER and DELETE. 
- Resize all images into the same size.
- Crop images if needed.

## Requirements

- Python3
- Pillow

## Installation

```shell
$ pip install Pillow

$ git clone https://github.com/kaz-yamam0t0/image-classifier
$ cd image-classifier/
```

## Usage

1. Put images into `data/` directory.
1. Start the server by executing `python app.py`.
1. Access to `http://localhost:8080/`
1. Classify images with `ENTER` or `DELETE`.
1. Converted images will be stored into `results/` directory.
	- `results/checked/` contains images with `ENTER`
	- `results/trash/` contains images with `DELETE`
	- `results/backup/` is a backup directory.

### Arguments

```shell
$ python app.py \
  --data-dir=./data/ \
  --result-dir=./results/ \
  --resize=512x512
```

## Licence

[MIT](./LICENSE)