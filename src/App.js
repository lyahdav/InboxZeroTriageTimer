import React, { Component } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch
} from "react-native";

const INTERVAL_MINUTES = 2;

const FAST_MODE = false;

const INITIAL_SECONDS_REMAINING = INTERVAL_MINUTES * 60;

class App extends Component {
  state = {
    secondsRemaining: INITIAL_SECONDS_REMAINING,
    timerStarted: false,
    done: false,
    numberTriaged: 0,
    totalSecondsElapsed: 0,
    overtimeSeconds: 0,
    showFireworks: true
  };

  beginCancelPressed() {
    if (this.state.timerStarted) {
      this.cancelTimer();
    } else {
      this.beginTimer();
    }
  }

  beginTimer() {
    this.setState({
      timerStarted: true,
      done: false,
      totalSecondsElapsed: 0,
      numberTriaged: 0,
      overtimeSeconds: 0
    });
    this.intervalHandle = setInterval(
      this.tick.bind(this),
      FAST_MODE ? 10 : 1000
    );
  }

  tick() {
    const newOvertimeSeconds =
      this.state.secondsRemaining < 1
        ? this.state.overtimeSeconds + 1
        : this.state.overtimeSeconds;
    this.setState(
      {
        secondsRemaining: this.state.secondsRemaining - 1,
        totalSecondsElapsed: this.state.totalSecondsElapsed + 1,
        overtimeSeconds: newOvertimeSeconds
      },
      () => {
        if (this.state.secondsRemaining == 0) {
          var audio = new Audio("/alarmwatch.mp3");
          audio.play();
        }
      }
    );
  }

  cancelTimer() {
    this.setState({
      secondsRemaining: INITIAL_SECONDS_REMAINING,
      timerStarted: false,
      numberTriaged: 0,
      totalSecondsElapsed: 0,
      overtimeSeconds: 0
    });
    clearInterval(this.intervalHandle);
  }

  nextButtonPressed() {
    this.setState({
      secondsRemaining: INITIAL_SECONDS_REMAINING,
      numberTriaged: this.state.numberTriaged + 1
    });
  }

  doneButtonPressed() {
    this.setState({
      secondsRemaining: INITIAL_SECONDS_REMAINING,
      timerStarted: false,
      numberTriaged: this.state.numberTriaged + 1,
      done: true
    });
    clearInterval(this.intervalHandle);
  }

  formatSecondsMinutes(totalSeconds) {
    const absSeconds = Math.abs(totalSeconds);
    const sign = totalSeconds < 0 ? "-" : "";
    const minutes = Math.floor(absSeconds / 60);
    const seconds = absSeconds - minutes * 60;
    return `${sign}${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  render() {
    window.triggerNextButton = () => {
      if (this.state.timerStarted) {
        this.nextButtonPressed();
      }
    };

    window.triggerDoneButton = () => {
      if (this.state.timerStarted) {
        this.doneButtonPressed();
      }
    };

    return (
      <ScrollView style={styles.app}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox Zero Triage Timer</Text>
        </View>
        <Button
          onPress={this.beginCancelPressed.bind(this)}
          title={this.state.timerStarted ? "Cancel triaging" : "Begin triaging"}
          color={this.state.timerStarted ? "#757981" : null}
        />
        <Text
          style={[
            styles.title,
            this.state.secondsRemaining <= 0 &&
            this.state.secondsRemaining % 2 === 0
              ? { backgroundColor: "#FFAAAA" }
              : {}
          ]}
        >
          {this.state.done
            ? "-:--"
            : this.formatSecondsMinutes(this.state.secondsRemaining)}
        </Text>
        {(this.state.timerStarted || this.state.done) && (
          <View>
            <Button
              onPress={this.nextButtonPressed.bind(this)}
              disabled={this.state.done}
              title="Next"
            />
            <View style={{ marginTop: 10 }}>
              <Button
                onPress={this.doneButtonPressed.bind(this)}
                title="Done"
                color="#00296F"
                disabled={this.state.done}
              />
            </View>
          </View>
        )}
        {(this.state.timerStarted || this.state.done) && (
          <View>
            <div
              className={
                this.state.done &&
                this.state.numberTriaged >= 1 &&
                this.state.showFireworks
                  ? "pyro"
                  : ""
              }
            >
              <div className="before" />
              <div className="after" />
            </div>
            <Text style={styles.title}>
              Triage count:{"\n"}
              {this.state.numberTriaged}
            </Text>
            <Text style={styles.title}>
              Elapsed time:{"\n"}
              {this.formatSecondsMinutes(this.state.totalSecondsElapsed)}
            </Text>
            {this.state.done && (
              <Text style={styles.title}>
                Overtime:{"\n"}
                {this.formatSecondsMinutes(this.state.overtimeSeconds)}
              </Text>
            )}
            {this.state.done && this.state.numberTriaged > 0 && (
              <Text style={styles.title}>
                Average time per item:{"\n"}
                {this.formatSecondsMinutes(
                  Math.round(
                    this.state.totalSecondsElapsed / this.state.numberTriaged
                  )
                )}
              </Text>
            )}
            {this.state.done && (
              <View styles={{ flexDirection: "row", flex: 1 }}>
                <Text>Toggle fireworks</Text>
                <Switch
                  value={this.state.showFireworks}
                  onValueChange={value => {
                    this.setState({ showFireworks: value });
                  }}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  app: {
    marginHorizontal: "auto"
  },
  header: {
    padding: 20
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.5rem",
    marginVertical: "1em",
    textAlign: "center"
  },
  text: {
    lineHeight: "1.5em",
    fontSize: "1.125rem",
    marginVertical: "1em",
    textAlign: "center"
  },
  link: {
    color: "#1B95E0"
  },
  code: {
    fontFamily: "monospace, monospace"
  }
});

export default App;
