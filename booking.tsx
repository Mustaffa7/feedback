import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Button, Card, CardBody, CardHeader, Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import SessionBookingRepository from "../../../../app/data/repository/session-booking.repository";
import { toProperCase } from "../../../../app/data/utils/normalize-string";
import DefaultHeader from "../../../../argon/Headers/DefaultHeader";
import UserLayout from "../../../../argon/Layouts/User";
import ChatComponent from "../../../../components/Chat";
import FormFeedback from "../../../../components/Forms/session/feedback";
import SessionBookingTable from "../../../../components/Tables/session-booking";
import ReactQueryDefault from "../../../../variables/react-query";
import userRepository from "../../../../app/data/repository/user.repository";
import feedbackRepository from "../../../../app/data/repository/feedback.repository";


function IndexPros() {
  const [uid, setUid] = useState<string>();
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sessionBooking = useQuery(["getSessionBooking", uid], () => SessionBookingRepository.getOne(uid!), {
    ...ReactQueryDefault,
    enabled: !!uid,
  });

  const feedback = useQuery(
    ["getFeedback", uid],
    () => feedbackRepository.getAll({limit: 1000, page: 1 }),
    {
      enabled: !!uid,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      initialData: {
        docs: [],
      },
    }
  );

  

  const user = useQuery(["getUserData"], () => userRepository.getMe(), {
    ...ReactQueryDefault,
  });

  const currentTime = new Date();
  const startTime = new Date(sessionBooking.data?.startDateTime!);
  const endTime = new Date(sessionBooking.data?.endDateTime!);

  useEffect(() => {
    if (currentTime > endTime && sessionBooking.data?.attendee) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [currentTime, startTime, endTime]);

  function handleSubmit() {
    setIsSubmitted(true);
  }

  return (
    <>

      <DefaultHeader />
      <Container className="mt--7 mb-7" fluid>
        {!uid ? (
          <>
            <SessionBookingTable onSelectUid={setUid} />
          </>
        ) : (
          <>
            <Row>
              <Col md="12" lg="6" className="px-0 px-md-3 px-lg-3">
                <Card>
                  <CardHeader className="bg-transparent border-0">
                    <Button size="sm" color="primary" onClick={() => setUid(undefined)}>
                      BACK
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col>
                        <h2>Schedule</h2>
                        {sessionBooking.data?.startDateTime &&
                          format(new Date(sessionBooking.data?.startDateTime!), "yyyy-MM-dd")}
                        <p>
                          {sessionBooking.data?.startDateTime &&
                            format(new Date(sessionBooking.data?.startDateTime!), "hh:mm a")}{" "}
                          -{" "}
                          {sessionBooking.data?.endDateTime &&
                            format(new Date(sessionBooking.data?.endDateTime!), "hh:mm a")}
                        </p>
                      </Col>
                      <Col>
                        <h3>Attendee</h3>
                        <p>{sessionBooking.data?.attendee.fullName || "-"}</p>
                      </Col>
                      <Col>
                        <h3>Status</h3>
                        <p>{sessionBooking.data?.status && toProperCase(sessionBooking.data?.status)}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h2>Plan</h2>
                        {sessionBooking.data?.sessionPlan.title}
                        <p>{sessionBooking.data?.sessionPlan.description}</p>
                      </Col>
                      <Col></Col>
                    </Row>
                    <Row>
                      <Col>
                        <h2>After Session</h2>
                        <Button
                          color="success"
                          className="mt-2 mt-lg-0 text-nowrap d-block d-lg-inline-block review-me"
                          disabled={isDisabled}
                          onClick={() => setShowFeedback(true)}
                        >
                          <span className="btn-inner--text text-white">Feedback</span>
                        </Button>
                        </Col>                     
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col md="12" lg="6" className="px-0 px-md-3 px-lg-3">
                {sessionBooking.data?.chatChannel ? (
                  <>
                    <ChatComponent chatChannelUid={sessionBooking.data?.chatChannel.uid} />
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <h5 className="h3 mb-0">Chat</h5>
                      </CardHeader>
                      <CardBody>
                        <p className="text-center">Not available</p>
                      </CardBody>
                    </Card>
                  </>
                )}
              </Col>
            </Row>
          </>
        )}
      </Container>
      
      <Modal isOpen={showFeedback} backdrop={"static"} size="xl" modalClassName="blur">
        <FormFeedback handleFormSubmit={handleSubmit} sessionBookingId={uid!} isDisabled={isDisabled} isSubmitted={isSubmitted} isOpen={(e) => setShowFeedback(e)} />
      </Modal>
      
    </>
  );
}

/*
<Modal isOpen={showFeedback} size="xl" modalClassName="blur">
        <FeedbackClass sessionBooking={sessionBookingUid!} isOpen={(e) => setShowFeedback(e)} />
      </Modal
*/ 

IndexPros.pageLayout = UserLayout;
export default IndexPros;
