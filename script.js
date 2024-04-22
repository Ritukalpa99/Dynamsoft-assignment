let DWObject, deviceList;
			function Dynamsoft_OnReady() {
				DWObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer");
				if (DWObject) {
					DWObject.Viewer.setViewMode(2, 2);
					deviceList = [];
					DWObject.GetDevicesAsync()
						.then(function (devices) {
							for (let i = 0; i < devices.length; i++) {
								document
									.getElementById("source")
									.options.add(new Option(devices[i].displayName, i));
								deviceList.push(devices[i]);
							}
						})
						.catch(function (exp) {
							alert(exp.message);
						});
				}
			}
			function AcquireImage() {
				if (DWObject) {
					let i,
						iPixelType = 0;
					for (i = 0; i < 3; i++) {
						if (document.getElementsByName("PixelType").item(i).checked == true)
							iPixelType = i;
					}

					let ddlSource = document.getElementById("source");
					if (ddlSource) {
						DWObject.SelectDeviceAsync(deviceList[ddlSource.selectedIndex])
							.then(function () {
								return DWObject.AcquireImageAsync({
									IfShowUI: document.getElementById("ShowUI").checked,
									PixelType: iPixelType,
									Resolution: document.getElementById("Resolution").value,
									IfFeederEnabled: document.getElementById("ADF").checked,

									IfCloseSourceAfterAcquire: true,
								});
							})
							.catch(function (exp) {
								alert(exp.message);
							});
					}
				}
			}

			function OnSuccess() {
				console.log("successful");
			}
			function OnFailure(errorCode, errorString) {
				if (errorCode != -2326) {
					alert(errorString);
				}
			}

			function SaveToLocalAsPdf() {
				if (DWObject) {
					if (DWObject.HowManyImagesInBuffer > 0) {
						DWObject.IfShowFileDialog = true;
						DWObject.SaveAllAsPDF("result.pdf", OnSuccess, OnFailure);
					}
				}
			}

			function SaveToLocalAsPdfSingly() {
				DWObject.RegisterEvent(
					"OnGetFilePath",
					(isSave, filesCount, index, directory, _fn) => {
						if (directory === "" && _fn === "") {
							console.log("User cancelled the operation.");
						} else {
							var path = directory + "\\" + _fn.substr(0, _fn.lastIndexOf("."));
							DWObject.IfShowFileDialog = false;
							for (var i = 1; i < DWObject.HowManyImagesInBuffer; i++) {
								DWObject.SaveSelectedImagesAsMultiPagePDF(
									path + "_" + i.toString() + ".pdf",
									i,
									OnSuccess,
									OnFailure
								);
							}
						}
					}
				);
				DWObject.IfShowFileDialog = true;
				DWObject.SaveSelectedImagesAsMultiPagePDF(
					"Image",
					1,
					OnSuccess,
					OnFailure
				);
			}

			function RemoveBlankImage() {
				DWObject.RegisterEvent("OnPostTransferAsync", function () {
					let index = DWObject.CurrentImageIndexInBuffer;
					if (DWObject.IsBlankImage(index)) DWObject.RemoveImage(index);
				});
			}

			function RemoveAllImages() {
				if (DWObject) {
					DWObject.RemoveAllImages();
				}
			}