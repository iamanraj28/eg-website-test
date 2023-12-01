import React from "react";
import {
  IconByName,
  AdminLayout as Layout,
  facilitatorRegistryService,
  testRegistryService,
  ImageView,
  AdminTypo,
  tableCustomStyles,
} from "@shiksha/common-lib";
import { useNavigate, useParams } from "react-router-dom";
import { HStack, Modal, VStack } from "native-base";
import Chip, { ChipStatus } from "component/Chip";
import DataTable from "react-data-table-component";
import Clipboard from "component/Clipboard";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const columns = (t, certificateDownload) => [
  {
    name: t("SR_NO"),
    selector: (row, index) => index + 1,
  },
  {
    name: t("PURPOSE"),
    selector: (row) => row?.context,
    attr: "name",
    wrap: true,
  },
  {
    name: t("SCORE"),
    selector: (row) => row?.score,
    attr: "name",
    wrap: true,
  },
  // {
  //   name: "Status",
  //   selector: (row) => row?.status,
  //   attr: "name",
  //   wrap: true,
  // },
  {
    name: t("STATUS"),
    selector: (row) =>
      row.certificate_status === true ? (
        <AdminTypo.Secondarybutton
          my="3"
          onPress={() => certificateDownload(row)}
        >
          {t("DOWNLOAD")}
        </AdminTypo.Secondarybutton>
      ) : row.certificate_status === false ? (
        <AdminTypo.H6 color="red.500">{t("FAILED")}</AdminTypo.H6>
      ) : (
        <AdminTypo.H6>{t("PENDING")}</AdminTypo.H6>
      ),
  },
];

export default function Certification({ footerLinks }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const [data, setData] = React.useState();
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [downloadCertificate, setDownCertificate] = React.useState();

  const reportTemplateRef = React.useRef(null);

  const handleGeneratePdf = async () => {
    // const doc = new jsPDF({
    //   format: "a4",
    //   unit: "px",
    // });

    // // Adding the fonts.
    // doc.setFont("Inter-Regular", "normal");

    // doc.html(reportTemplateRef.current, {
    //   async callback(doc) {
    //     await doc.save("document");
    //   },
    // });

    const input = reportTemplateRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l");
      pdf.addImage(imgData, "JPEG", 0, 0);
      // pdf.output('dataurlnewwindow');
      pdf.save("download.pdf");
    });
  };
  const certificateDownload = async (data) => {
    const result = await testRegistryService.postCertificates(data);
    setDownCertificate(result?.data?.[0]?.certificate_html);
  };

  React.useEffect(async () => {
    const profileDetails = async () => {
      setLoading(true);
      const result = await facilitatorRegistryService.getOne({ id });
      setData(result);
      setLoading(false);
    };
    await profileDetails();
  }, []);

  React.useEffect(async () => {
    const result = await testRegistryService.getCertificate({ id });
    setCertificateData(result?.data);
  }, []);

  return (
    <Layout _sidebar={footerLinks}>
      <VStack flex={1} space={"4"} p="3">
        <HStack alignItems={"center"} space="1" pt="3">
          <IconByName name="UserLineIcon" size="md" />
          <AdminTypo.H1 color="Activatedcolor.400">
            {t("ALL_PRERAK")}
          </AdminTypo.H1>
          <IconByName
            size="sm"
            name="ArrowRightSLineIcon"
            onPress={(e) => navigate(-1)}
          />
          <AdminTypo.H1
            color="textGreyColor.800"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {data?.first_name} {data?.last_name}
          </AdminTypo.H1>
          <IconByName
            size="sm"
            name="ArrowRightSLineIcon"
            onPress={(e) => navigate(-1)}
          />
          <Clipboard text={data?.id}>
            <Chip textAlign="center" lineHeight="15px" label={data?.id} />
          </Clipboard>
        </HStack>
        <HStack justifyContent={"space-between"} flexWrap="wrap">
          <VStack space="2" flexWrap="wrap">
            <ChipStatus status={data?.status} />
            <HStack
              bg="badgeColor.400"
              rounded={"md"}
              alignItems="center"
              p="2"
            >
              <IconByName
                _icon={{ size: "18px" }}
                name="CellphoneLineIcon"
                color="textGreyColor.300"
              />
              <AdminTypo.H6 color="textGreyColor.600" bold>
                {data?.mobile}
              </AdminTypo.H6>
            </HStack>
            <HStack
              bg="badgeColor.400"
              rounded={"md"}
              p="2"
              alignItems="center"
              space="2"
            >
              <IconByName
                isDisabled
                _icon={{ size: "20px" }}
                name="MapPinLineIcon"
                color="textGreyColor.300"
              />
              <AdminTypo.H6 color="textGreyColor.600" bold>
                {[
                  data?.state,
                  data?.district,
                  data?.block,
                  data?.village,
                  data?.grampanchayat,
                ]
                  .filter((e) => e)
                  .join(",")}
              </AdminTypo.H6>
            </HStack>
          </VStack>
          <HStack flex="0.5" justifyContent="center">
            {data?.profile_photo_1?.name ? (
              <ImageView
                source={{
                  uri: data?.profile_photo_1?.name,
                }}
                alt="profile photo"
                width={"120px"}
                height={"120px"}
              />
            ) : (
              <IconByName
                isDisabled
                name="AccountCircleLineIcon"
                color="textGreyColor.300"
                _icon={{ size: "190px" }}
              />
            )}
          </HStack>
        </HStack>

        <VStack space={"5"}>
          <HStack justifyContent={"space-between"}>
            <AdminTypo.H4 bold color="textGreyColor.800">
              {t("CERTIFICATION")}
            </AdminTypo.H4>
            <HStack></HStack>
          </HStack>

          <DataTable
            bg="light.100"
            customStyles={tableCustomStyles}
            columns={[...columns(t, certificateDownload)]}
            data={certificateData}
            selectableRows
            persistTableHead
            progressPending={loading}
            pagination
            paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
            paginationServer
            onChangeRowsPerPage={(e) => {
              setFilter({ ...filter, limit: e });
            }}
            onChangePage={(e) => {
              setFilter({ ...filter, page: e });
            }}
          />
        </VStack>
      </VStack>
      <Modal isOpen={downloadCertificate} size="xl">
        <Modal.Content>
          <Modal.Header>
            <HStack justifyContent={"space-between"} pr="10">
              <AdminTypo.H1>{t("CERTIFICATION")}</AdminTypo.H1>
              <AdminTypo.Secondarybutton onPress={() => handleGeneratePdf()}>
                {t("DOWNLOAD")}
              </AdminTypo.Secondarybutton>
              <IconByName
                name="CloseCircleLineIcon"
                onPress={(e) => setDownCertificate()}
              />
            </HStack>
          </Modal.Header>
          <Modal.Body
            style={{
              backgroundColor: "#f5f5f5",
              width: "297mm",
              minHeight: "210mm",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div ref={reportTemplateRef}>
              <div dangerouslySetInnerHTML={{ __html: downloadCertificate }} />
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Layout>
  );
}
