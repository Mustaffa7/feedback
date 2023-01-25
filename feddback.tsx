import { required } from "joi";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import Select from "react-select";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import SessionFeedbackRepository from "../../../app/data/repository/feedback.repository";
import { errorHandler } from "../../../app/data/utils/errorHandler";
import ReactQueryDefault from "../../../variables/react-query";
import LoadingSpinnerOne from "../../Loading/spinner1";
import { ErrorMessage } from "@hookform/error-message";
import { renameRef } from "../../../app/data/utils/react-hook-form.utils";
import SessionFeedback from "../../../app/core/feedback/feedback.entity";
import SessionBooking from "../../../app/core/session-booking/session-booking.entity";
import Swal from "sweetalert2";

export default function FormFeedback({ sessionBookingId, handleFormSubmit, isOpen, isDisabled, isSubmitted }: Props) {
  const {
    control,
    handleSubmit,
    register,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const feedback = useQuery(
    ["getFeedback", sessionBookingId],
    () => SessionFeedbackRepository.getBySessionBooking(sessionBookingId!),
    {
      ...ReactQueryDefault,
      enabled: !!sessionBookingId,
    }
  );

  const create = useMutation((data: any) => SessionFeedbackRepository.create(data), {
    onError: (e) => {
      const message = errorHandler(e).message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    },
    onSuccess: (e) => {
      handleFormSubmit(e);
      Swal.fire({
        icon: "success",
        title: "Your feedback has been submitted!",
        text: "Thank you!",
      });
      feedback.refetch();
      reset();
      location.reload();
    },
  });

  const remove = useMutation(
    async (data: any) => {
      if (confirm("delete?")) {
        await SessionFeedbackRepository.delete(data);
        return "Deleted";
      } else {
        return "";
      }
    },
    {
      onError: (e) => alert(errorHandler(e).message),
      onSuccess: (e) => {
        if (e) alert(e);
        feedback.refetch();
      },
    }
  );

  return (
    <>
      <Container>
        <Card>
          <CardBody>
            <Form
              onSubmit={handleFormSubmit((e) =>
                create.mutate({
                  ...e,
                  unclearTopic: getValues("SessionFeedback.unclearTopic"),
                  usefulTopic: getValues("SessionFeedback.usefulTopic"),
                  recommendation: getValues("SessionFeedback.recommendation"),
                  mentorPacing: getValues("SessionFeedback.mentorPacing"),
                  importantTopic: getValues("SessionFeedback.importantTopic"),
                  comment: getValues("SessionFeedback.comment"),
                  sessionBooking: {
                    uid: sessionBookingId,
                  },
                })
              )} 
              disabled={isDisabled || isSubmitted} 
            >
              <FormGroup row>
                <Col>
                  <FormGroup>
                    <h3> Please fill your Feedback</h3>
                    <FormGroup></FormGroup>
                  </FormGroup>
                  <FormGroup>
                    <Label>What issues presented today still remain confusing and/or unclear</Label>
                    <FormGroup>
                      <Input
                        type="text"
                        defaultValue={getValues("SessionFeedback.unclearTopic")}
                        {...renameRef(
                          register("SessionFeedback.unclearTopic", {
                            required: true,
                          })
                        )}
                      />
                    </FormGroup>
                  </FormGroup>
                  <FormGroup>
                    <Label>Which topics are most useful?</Label>
                    <Input
                      type="text"
                      defaultValue={getValues("SessionFeedback.usefulTopic")}
                      {...renameRef(
                        register("SessionFeedback.usefulTopic", {
                          required: true,
                        })
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>It would help me if you would...</Label>
                    <Input
                      type="text"
                      defaultValue={getValues("SessionFeedback.recommendation")}
                      {...renameRef(
                        register("SessionFeedback.recommendation", {
                          required: true,
                        })
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>My mentor's pacing is</Label>
                    <Input
                      type="text"
                      placeholder="too slow/just right/too fast"
                      defaultValue={getValues("SessionFeedback.mentorPacing")}
                      {...renameRef(
                        register("SessionFeedback.mentorPacing", {
                          required: true,
                        })
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>The items that are very important for me that my mentor should cover are...</Label>
                    <Input
                      type="text"
                      defaultValue={getValues("SessionFeedback.importantTopic")}
                      {...renameRef(
                        register("SessionFeedback.importantTopic", {
                          required: true,
                        })
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Comments</Label>
                    <Input
                      type="textarea"
                      defaultValue={getValues("SessionFeedback.comment")}
                      {...renameRef(
                        register("SessionFeedback.comment", {
                          required: false,
                        })
                      )}
                    />
                  </FormGroup>
                </Col>
              </FormGroup>
              <Button color="danger" onClick={() => isOpen(false)}>
                Cancel
              </Button>
              <Button color="success" disabled={isDisabled || isSubmitted}>
                Submit
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

interface Props {
  sessionBookingId: string;
  isOpen: (e: boolean) => void;
  isDisabled: boolean;
  isSubmitted: boolean;
  handleFormSubmit: () => void;
}
